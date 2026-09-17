package com.kora.service;

import com.kora.dto.request.CheckoutRequest;
import com.kora.dto.request.OrderStatusUpdateRequest;
import com.kora.dto.response.*;
import com.kora.entity.*;
import com.kora.exception.ApiException;
import com.kora.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal DELIVERY_FEE = new BigDecimal("1500.00");

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final NotificationService notificationService;
    private final com.kora.payment.PaymentService paymentService;

    // ---------------- CHECKOUT ----------------
    @Transactional
    public OrderResponse checkout(String email, CheckoutRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        // Validate stock + build order items
        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .deliveryName(req.deliveryName())
                .deliveryPhone(req.deliveryPhone())
                .deliveryAddress(req.deliveryAddress())
                .deliveryFee(DELIVERY_FEE)
                .build();

        for (CartItem ci : cart.getItems()) {
            Product p = ci.getProduct();
            if (!p.isActive()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Product no longer available: " + p.getName());
            }
            if (p.getStock() < ci.getQuantity()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Not enough stock for: " + p.getName());
            }

            BigDecimal unit = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(ci.getQuantity()));

            // Decrement stock (optimistic lock on Product.version prevents overselling)
            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);

            items.add(OrderItem.builder()
                    .order(order)
                    .product(p)
                    .seller(p.getSeller())
                    .productName(p.getName())
                    .unitPrice(unit)
                    .quantity(ci.getQuantity())
                    .lineTotal(lineTotal)
                    .build());

            subtotal = subtotal.add(lineTotal);
        }

        order.setItems(items);
        order.setSubtotal(subtotal);
        order.setTotal(subtotal.add(DELIVERY_FEE));

        // Estimated delivery: base 3 days + 1 day per seller if more than 1
        long distinctSellers = items.stream().map(i -> i.getSeller().getId()).distinct().count();
        long days = 3 + Math.max(0, distinctSellers - 1);
        order.setEstimatedDelivery(Instant.now().plus(days, ChronoUnit.DAYS));

        order = orderRepository.save(order);

        // Add initial status history
        addHistory(order, OrderStatus.PENDING, "Order placed", user);
        notificationService.notify(order.getUser(), "ORDER_PLACED",
                "Order placed",
                "Your order #" + order.getId() + " has been placed. Estimated delivery: " + order.getEstimatedDelivery(),
                "/orders/" + order.getId());

        // Notify every seller whose product is in this order
        java.util.Set<Long> notifiedSellers = new java.util.HashSet<>();
        for (OrderItem item : order.getItems()) {
            Long sellerId = item.getSeller().getId();
            if (notifiedSellers.add(sellerId)) {
                notificationService.notify(item.getSeller(), "NEW_ORDER",
                        "New order received",
                        "You have a new order #" + order.getId() + " for " + item.getProductName() + ". Please prepare for shipment.",
                        "/vendor/orders");
            }
        }

        // Clear cart
        cartService.clearCart(email);

        return toResponse(order);
    }

    // ---------------- MARK AS PAID (payment simulation) ----------------
    @Transactional
    public OrderResponse markAsPaid(String email, Long orderId) {
        Order order = loadOwnOrder(email, orderId);
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order is not pending");
        }
        var result = paymentService.charge(order);
        if (!result.success()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment failed: " + result.message());
        }
        transitionTo(order, OrderStatus.PAID, "Payment confirmed (ref: " + result.transactionRef() + ")", order.getUser());
        notificationService.notify(order.getUser(), "ORDER_PAID",
                "Payment received",
                "Your payment for order #" + order.getId() + " was confirmed. We're preparing your items.",
                "/orders/" + order.getId());
        return toResponse(orderRepository.save(order));
    }

    // ---------------- LIST ----------------
    @Transactional(readOnly = true)
    public Page<OrderResponse> listMyOrders(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(
                user.getId(), PageRequest.of(page, Math.min(size, 50)))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listAll(int page, int size) {
        return orderRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, Math.min(size, 50)))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(String email, Long orderId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!isAdmin && !order.getUser().getEmail().equals(email)) {
            // Sellers can also view orders containing their items
            boolean sellerHasItem = order.getItems().stream()
                    .anyMatch(i -> i.getSeller().getEmail().equals(email));
            if (!sellerHasItem) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Not your order");
            }
        }
        return toResponse(order);
    }

    // ---------------- TRACKING ----------------
    @Transactional(readOnly = true)
    public OrderTrackingResponse getTracking(String email, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUser().getEmail().equals(email)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your order");
        }

        List<OrderStatusHistoryResponse> timeline = order.getHistory().stream()
                .map(h -> new OrderStatusHistoryResponse(
                        h.getStatus(),
                        h.getNote(),
                        h.getCreatedAt(),
                        h.getChangedBy() != null ? h.getChangedBy().getFullName() : "System"))
                .toList();

        // What remains after the current status
        List<OrderStatus> flow = List.of(
                OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PACKED,
                OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED);

        int currentIdx = flow.indexOf(order.getStatus());
        List<OrderStatus> remaining = currentIdx >= 0
                ? flow.subList(currentIdx + 1, flow.size())
                : List.of();

        return new OrderTrackingResponse(
                order.getId(),
                order.getStatus(),
                order.getEstimatedDelivery(),
                order.getStatus() == OrderStatus.DELIVERED,
                timeline,
                remaining);
    }

    // ---------------- STATUS UPDATE (SELLER / ADMIN) ----------------
    @Transactional
    public OrderResponse updateStatus(String email, Long orderId, OrderStatusUpdateRequest req, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        // Seller can only move PAID -> PACKED -> SHIPPED on their own items
        if (!isAdmin) {
            boolean sellerHasItem = order.getItems().stream()
                    .anyMatch(i -> i.getSeller().getEmail().equals(email));
            if (!sellerHasItem) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Not your order");
            }
            if (req.status() != OrderStatus.PACKED && req.status() != OrderStatus.SHIPPED) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Sellers can only mark PACKED or SHIPPED");
            }
        }

        validateTransition(order.getStatus(), req.status());
        transitionTo(order, req.status(), req.note(), actor);
        notificationService.notify(order.getUser(), "ORDER_STATUS",
                "Order status updated",
                "Order #" + order.getId() + " is now " + req.status().name().replace("_", " ").toLowerCase() + ".",
                "/orders/" + order.getId());
        return toResponse(orderRepository.save(order));
    }

    // ---------------- helpers ----------------
    private void validateTransition(OrderStatus from, OrderStatus to) {
        if (from == OrderStatus.CANCELLED || from == OrderStatus.DELIVERED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order is in a final state");
        }
        List<OrderStatus> flow = List.of(
                OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PACKED,
                OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED);
        int fromIdx = flow.indexOf(from);
        int toIdx = flow.indexOf(to);
        if (toIdx <= fromIdx) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Cannot move from " + from + " to " + to);
        }
    }

    private void transitionTo(Order order, OrderStatus status, String note, User actor) {
        order.setStatus(status);
        addHistory(order, status, note, actor);
    }

    private void addHistory(Order order, OrderStatus status, String note, User actor) {
        order.getHistory().add(OrderStatusHistory.builder()
                .order(order)
                .status(status)
                .note(note)
                .changedBy(actor)
                .build());
    }

    private Order loadOwnOrder(String email, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUser().getEmail().equals(email)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your order");
        }
        return order;
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> items = o.getItems().stream().map(i -> new OrderItemResponse(
                i.getId(), i.getProduct().getId(), i.getProductName(),
                i.getProduct().getImages().isEmpty() ? null : i.getProduct().getImages().get(0).getUrl(),
                i.getUnitPrice(), i.getQuantity(), i.getLineTotal(),
                i.getSeller().getId(), i.getSeller().getFullName()
        )).toList();

        return new OrderResponse(
                o.getId(), o.getStatus(),
                o.getSubtotal(), o.getDeliveryFee(), o.getTotal(),
                o.getDeliveryName(), o.getDeliveryPhone(), o.getDeliveryAddress(),
                o.getEstimatedDelivery(), items,
                o.getCreatedAt(), o.getUpdatedAt());
    }
}