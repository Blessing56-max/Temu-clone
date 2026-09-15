package com.kora.dto.response;
import com.kora.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
public record OrderResponse(
    Long id, OrderStatus status,
    BigDecimal subtotal, BigDecimal deliveryFee, BigDecimal total,
    String deliveryName, String deliveryPhone, String deliveryAddress,
    Instant estimatedDelivery,
    List<OrderItemResponse> items,
    Instant createdAt, Instant updatedAt
) {}