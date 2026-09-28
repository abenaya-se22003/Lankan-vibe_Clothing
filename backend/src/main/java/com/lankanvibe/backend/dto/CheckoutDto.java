package com.lankanvibe.backend.dto;

import com.lankanvibe.backend.model.Checkout;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * CheckoutDto - Transfer object for checkout session details
 */
public class CheckoutDto {

    private Long id;
    private Long userId;
    private Long orderId;
    private String shippingAddress;
    private Checkout.PaymentMethod paymentMethod;
    private Checkout.PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;

    public CheckoutDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public Checkout.PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(Checkout.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public Checkout.PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(Checkout.PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
