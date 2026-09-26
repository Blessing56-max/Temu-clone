package com.kora.paystack;

import com.kora.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Wraps Paystack REST API. Uses Spring Boot 3.3's RestClient.
 * All amounts sent to Paystack are in kobo (1 NGN = 100 kobo).
 */
@Slf4j
@Service
public class PaystackService {

    private final RestClient client;
    private final String publicKey;

    public PaystackService(
            @Value("${paystack.secret-key}") String secretKey,
            @Value("${paystack.public-key}") String publicKey) {
        this.publicKey = publicKey;
        this.client = RestClient.builder()
                .baseUrl("https://api.paystack.co")
                .defaultHeader("Authorization", "Bearer " + secretKey)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    public String getPublicKey() {
        return publicKey;
    }

    // ---------------- BANK LIST ----------------
    public List<PaystackDtos.Bank> listBanks() {
        try {
            var resp = client.get()
                    .uri("/bank?country=nigeria&currency=NGN")
                    .retrieve()
                    .body(PaystackDtos.BankListResponse.class);
            if (resp == null || !resp.status()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack bank list failed");
            }
            return resp.data();
        } catch (RestClientException e) {
            log.error("Paystack listBanks failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Could not reach Paystack");
        }
    }

    // ---------------- RESOLVE BANK ACCOUNT ----------------
    public String resolveAccountName(String accountNumber, String bankCode) {
        try {
            var resp = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/bank/resolve")
                            .queryParam("account_number", accountNumber)
                            .queryParam("bank_code", bankCode)
                            .build())
                    .retrieve()
                    .body(PaystackDtos.BankResolveResponse.class);

            if (resp == null || !resp.status() || resp.data() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Bank account could not be verified. Check the account number and bank.");
            }
            return resp.data().accountName();
        } catch (RestClientException e) {
            log.error("Paystack resolveAccountName failed", e);
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Bank account could not be verified. Paystack returned an error.");
        }
    }

    // ---------------- CREATE TRANSFER RECIPIENT ----------------
    public String createTransferRecipient(String name, String accountNumber, String bankCode) {
        var req = new PaystackDtos.CreateRecipientRequest(
                "nuban", name, accountNumber, bankCode, "NGN"
        );
        try {
            var resp = client.post()
                    .uri("/transferrecipient")
                    .body(req)
                    .retrieve()
                    .body(PaystackDtos.CreateRecipientResponse.class);

            if (resp == null || !resp.status() || resp.data() == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Could not register seller with Paystack");
            }
            return resp.data().recipientCode();
        } catch (RestClientException e) {
            log.error("Paystack createTransferRecipient failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack recipient creation failed");
        }
    }

    // ---------------- INITIALIZE TRANSACTION (buyer pays) ----------------
    public PaystackDtos.InitTransactionResponse.InitData initializeTransaction(
            String email, BigDecimal amountNgn, String reference, String callbackUrl) {
        long kobo = amountNgn.multiply(BigDecimal.valueOf(100)).longValue();
        var req = new PaystackDtos.InitTransactionRequest(
                email, kobo, callbackUrl, reference, null
        );
        try {
            var resp = client.post()
                    .uri("/transaction/initialize")
                    .body(req)
                    .retrieve()
                    .body(PaystackDtos.InitTransactionResponse.class);

            if (resp == null || !resp.status() || resp.data() == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Could not initialize payment");
            }
            return resp.data();
        } catch (RestClientException e) {
            log.error("Paystack initializeTransaction failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack initialize failed");
        }
    }

    // ---------------- VERIFY TRANSACTION ----------------
    public PaystackDtos.VerifyTransactionResponse.VerifyData verifyTransaction(String reference) {
        try {
            var resp = client.get()
                    .uri("/transaction/verify/{ref}", reference)
                    .retrieve()
                    .body(PaystackDtos.VerifyTransactionResponse.class);

            if (resp == null || !resp.status() || resp.data() == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Payment verification failed");
            }
            return resp.data();
        } catch (RestClientException e) {
            log.error("Paystack verifyTransaction failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack verify failed");
        }
    }

    // ---------------- TRANSFER TO SELLER (payout) ----------------
    public PaystackDtos.InitiateTransferResponse.TransferData initiateTransfer(
            BigDecimal amountNgn, String recipientCode, String reason) {
        long kobo = amountNgn.multiply(BigDecimal.valueOf(100)).longValue();
        String ref = "kora_payout_" + UUID.randomUUID().toString().substring(0, 12);
        var req = new PaystackDtos.InitiateTransferRequest(
                "balance", kobo, recipientCode, reason, ref
        );
        try {
            var resp = client.post()
                    .uri("/transfer")
                    .body(req)
                    .retrieve()
                    .body(PaystackDtos.InitiateTransferResponse.class);

            if (resp == null || !resp.status() || resp.data() == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Transfer to seller failed");
            }
            return resp.data();
        } catch (RestClientException e) {
            log.error("Paystack initiateTransfer failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack transfer failed");
        }
    }
}