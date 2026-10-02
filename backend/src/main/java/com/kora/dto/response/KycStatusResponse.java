package com.kora.dto.response;

import com.kora.entity.KycStatus;
import java.time.Instant;

public record KycStatusResponse(
    KycStatus status,
    String rejectionReason,
    String businessName,
    String accountName,
    String bankName,
    String accountNumberMasked,
    String accountNumber,
    Instant submittedAt,
    Instant verifiedAt
) {}