package com.kora.dto.response;
import com.kora.entity.OrderStatus;
import java.time.Instant;
import java.util.List;
public record OrderTrackingResponse(
    Long orderId,
    OrderStatus currentStatus,
    Instant estimatedDelivery,
    boolean delivered,
    List<OrderStatusHistoryResponse> timeline,
    List<OrderStatus> remainingSteps
) {}