package com.kora.dto.request;
import jakarta.validation.constraints.*;
public record CheckoutRequest(
    @NotBlank @Size(max = 255) String deliveryName,
    @NotBlank @Size(max = 50) String deliveryPhone,
    @NotBlank @Size(max = 1000) String deliveryAddress
) {}