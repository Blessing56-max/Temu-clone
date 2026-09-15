package com.kora.dto.response;
import com.kora.entity.OrderStatus;
import java.time.Instant;
public record OrderStatusHistoryResponse(
    OrderStatus status, String note, Instant createdAt, String changedBy
) {}