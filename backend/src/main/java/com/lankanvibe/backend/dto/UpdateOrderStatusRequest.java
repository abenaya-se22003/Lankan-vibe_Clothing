package com.lankanvibe.backend.dto;

import com.lankanvibe.backend.model.Order;
import jakarta.validation.constraints.NotNull;

/**
 * UpdateOrderStatusRequest - Admin payload to update order status
 */
public class UpdateOrderStatusRequest {

    @NotNull(message = "Order status is required")
    private Order.Status status;

    public UpdateOrderStatusRequest() {}

    public UpdateOrderStatusRequest(Order.Status status) {
        this.status = status;
    }

    public Order.Status getStatus() { return status; }
    public void setStatus(Order.Status status) { this.status = status; }
}
