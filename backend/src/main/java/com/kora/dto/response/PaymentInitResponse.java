package com.kora.dto.response;

public record PaymentInitResponse(
    String authorizationUrl,
    String reference,
    String publicKey
) {}