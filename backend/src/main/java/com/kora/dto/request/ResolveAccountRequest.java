package com.kora.dto.request;

import jakarta.validation.constraints.*;

public record ResolveAccountRequest(
    @NotBlank @Pattern(regexp = "\\d{10}", message = "Account number must be 10 digits") String accountNumber,
    @NotBlank @Size(max = 20) String bankCode
) {}