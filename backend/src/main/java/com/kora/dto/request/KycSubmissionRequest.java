package com.kora.dto.request;

import jakarta.validation.constraints.*;

public record KycSubmissionRequest(
    @NotBlank @Size(max = 50) String idType,
    @NotBlank @Size(max = 100) String idNumber,
    @NotBlank @Size(max = 500) String idDocumentUrl,
    @NotBlank @Size(max = 500) String selfieUrl,

    @NotBlank @Size(max = 255) String businessName,
    @NotBlank @Size(max = 1000) String businessAddress,
    @NotBlank @Size(max = 100) String city,
    @NotBlank @Size(max = 100) String state,
    @NotBlank @Size(max = 20) String zipCode,
    @NotNull Double latitude,
    @NotNull Double longitude,

    @NotBlank @Size(max = 100) String bankName,
    @NotBlank @Size(max = 20) String bankCode,
    @NotBlank @Pattern(regexp = "\\d{10}", message = "Account number must be 10 digits") String accountNumber
) {}