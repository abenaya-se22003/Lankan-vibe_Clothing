package com.lankanvibe.backend.dto;

import com.lankanvibe.backend.model.Checkout;
import jakarta.validation.constraints.NotBlank;

/**
 * CheckoutRequest - Payload to initiate checkout session
 */
public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private Checkout.PaymentMethod paymentMethod = Checkout.PaymentMethod.COD;

    public CheckoutRequest() {}

    public CheckoutRequest(String shippingAddress, Checkout.PaymentMethod paymentMethod) {
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
    }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public Checkout.PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(Checkout.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}
