package com.kora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "seller_verifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SellerVerification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false, unique = true)
    private User seller;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private KycStatus status = KycStatus.UNVERIFIED;

    // Identity
    @Column(name = "id_type", length = 50)
    private String idType;
    @Column(name = "id_number", length = 100)
    private String idNumber;
    @Column(name = "id_document_url", length = 500)
    private String idDocumentUrl;
    @Column(name = "selfie_url", length = 500)
    private String selfieUrl;

    // Business
    @Column(name = "business_name")
    private String businessName;
    @Column(name = "business_address", columnDefinition = "TEXT")
    private String businessAddress;
    @Column(length = 100)
    private String city;
    @Column(length = 100)
    private String state;
    @Column(length = 100)
    @Builder.Default
    private String country = "Nigeria";
    @Column(name = "zip_code", length = 20)
    private String zipCode;
    private Double latitude;
    private Double longitude;

    // Bank
    @Column(name = "bank_name", length = 100)
    private String bankName;
    @Column(name = "bank_code", length = 20)
    private String bankCode;
    @Column(name = "account_number", length = 20)
    private String accountNumber;
    @Column(name = "account_name")
    private String accountName;
    @Column(name = "paystack_recipient_code", length = 100)
    private String paystackRecipientCode;

    // Admin review
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;
    @Column(name = "verified_at")
    private Instant verifiedAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}