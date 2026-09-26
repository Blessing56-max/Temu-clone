package com.kora.paystack;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

/**
 * All Paystack API request/response shapes as Java records.
 * Field names match Paystack's JSON (snake_case) via @JsonProperty.
 */
public final class PaystackDtos {

    private PaystackDtos() {}

    // -------- Bank list --------
    public record Bank(String name, String code, String slug) {}

    public record BankListResponse(
            boolean status,
            String message,
            List<Bank> data
    ) {}

    // -------- Bank account resolve --------
    public record BankResolveResponse(
            boolean status,
            String message,
            AccountData data
    ) {
        public record AccountData(
                @JsonProperty("account_number") String accountNumber,
                @JsonProperty("account_name") String accountName
        ) {}
    }

    // -------- Transfer recipient --------
    public record CreateRecipientRequest(
            String type,
            String name,
            @JsonProperty("account_number") String accountNumber,
            @JsonProperty("bank_code") String bankCode,
            String currency
    ) {}

    public record CreateRecipientResponse(
            boolean status,
            String message,
            RecipientData data
    ) {
        public record RecipientData(
                @JsonProperty("recipient_code") String recipientCode,
                String type,
                String name,
                @JsonProperty("account_number") String accountNumber,
                @JsonProperty("bank_code") String bankCode
        ) {}
    }

    // -------- Initiate transaction (buyer pays) --------
    public record InitTransactionRequest(
            String email,
            long amount,           // in kobo (NGN * 100)
            @JsonProperty("callback_url") String callbackUrl,
            @JsonProperty("reference") String reference,
            @JsonProperty("metadata") Object metadata
    ) {}

    public record InitTransactionResponse(
            boolean status,
            String message,
            InitData data
    ) {
        public record InitData(
                @JsonProperty("authorization_url") String authorizationUrl,
                @JsonProperty("access_code") String accessCode,
                String reference
        ) {}
    }

    // -------- Verify transaction --------
    public record VerifyTransactionResponse(
            boolean status,
            String message,
            VerifyData data
    ) {
        public record VerifyData(
                String status,
                String reference,
                BigDecimal amount,
                @JsonProperty("gateway_response") String gatewayResponse,
                @JsonProperty("paid_at") String paidAt,
                Customer customer
        ) {}

        public record Customer(String email) {}
    }

    // -------- Transfer money to seller --------
    public record InitiateTransferRequest(
            String source,
            long amount,           // kobo
            @JsonProperty("recipient") String recipientCode,
            String reason,
            @JsonProperty("reference") String reference
    ) {}

    public record InitiateTransferResponse(
            boolean status,
            String message,
            TransferData data
    ) {
        public record TransferData(
                @JsonProperty("transfer_code") String transferCode,
                String reference,
                String status
        ) {}
    }
}