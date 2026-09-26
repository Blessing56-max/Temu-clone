package com.kora.dto.response;

public record ResolveAccountResponse(
    String accountName,
    boolean matchesSellerName,
    String expectedSellerName
) {}