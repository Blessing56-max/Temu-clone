package com.kora.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kora.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Slf4j
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class PaystackWebhookController {

    @Value("${paystack.secret-key}")
    private String secretKey;

    private final OrderService orderService;
    private final ObjectMapper mapper;

    @PostMapping("/paystack")
    public ResponseEntity<String> handlePaystackWebhook(
            @RequestBody String rawBody,
            @RequestHeader("X-Paystack-Signature") String signature) {

        if (!isValidSignature(rawBody, signature)) {
            log.warn("Invalid webhook signature detected.");
            return ResponseEntity.status(401).body("Invalid signature");
        }

        try {
            JsonNode event = mapper.readTree(rawBody);
            String eventType = event.get("event").asText();
            
            if ("charge.success".equals(eventType)) {
                JsonNode data = event.get("data");
                String reference = data.get("reference").asText();
                
                // Reference format is "kora_<orderId>_<uuid>"
                Long orderId = Long.parseLong(reference.split("_")[1]);
                
                log.info("Webhook confirmed payment for order: {}", orderId);
                orderService.markAsPaidFromWebhook(orderId);
            }
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            return ResponseEntity.ok("Processing Error"); // Always return 200 to avoid retries
        }
    }

    private boolean isValidSignature(String body, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(keySpec);
            byte[] hash = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            
            return MessageDigest.isEqual(hexString.toString().getBytes(), signature.getBytes());
        } catch (Exception e) {
            return false;
        }
    }
}