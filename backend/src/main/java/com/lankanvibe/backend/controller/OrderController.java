package com.lankanvibe.backend.controller;

import com.lankanvibe.backend.dto.CreateOrderRequest;
import com.lankanvibe.backend.dto.OrderDto;
import com.lankanvibe.backend.dto.UpdateOrderStatusRequest;
import com.lankanvibe.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * OrderController - REST API endpoints for customer orders and admin order tracking
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // POST /api/orders - Place a new order from current cart
    @PostMapping("/orders")
    public ResponseEntity<OrderDto> createOrder(@AuthenticationPrincipal UserDetails userDetails,
                                                @Valid @RequestBody CreateOrderRequest request) {
        OrderDto created = orderService.createOrderFromCart(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET /api/orders/my - Get authenticated user's order history
    @GetMapping("/orders/my")
    public ResponseEntity<List<OrderDto>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.getMyOrders(userDetails.getUsername()));
    }

    // GET /api/orders/{id} - Get order details by ID
    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderDto> getOrderById(@AuthenticationPrincipal UserDetails userDetails,
                                                 @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(userDetails.getUsername(), id));
    }

    // GET /api/admin/orders - Admin: view all customer orders
    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // PUT /api/admin/orders/{id}/status - Admin: update order status
    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }
}
