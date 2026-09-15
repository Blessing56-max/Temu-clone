package com.kora.payment;

import com.kora.entity.Order;

public interface PaymentService {
    PaymentResult charge(Order order);
    record PaymentResult(boolean success, String transactionRef, String message) {}
}