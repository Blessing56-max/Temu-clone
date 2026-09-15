package com.kora.payment;

import com.kora.entity.Order;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MockPaymentService implements PaymentService {

    @Override
    public PaymentResult charge(Order order) {
        String ref = "mock_" + UUID.randomUUID().toString().substring(0, 12);
        return new PaymentResult(true, ref, "Payment successful");
    }
}