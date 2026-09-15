package com.kora.dto.request;
import com.kora.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record OrderStatusUpdateRequest(
    @NotNull OrderStatus status,
    @Size(max = 500) String note
) {}