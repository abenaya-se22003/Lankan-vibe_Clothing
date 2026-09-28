package com.lankanvibe.backend.service;

import com.lankanvibe.backend.dto.CheckoutDto;
import com.lankanvibe.backend.dto.CheckoutRequest;
import com.lankanvibe.backend.dto.CreateOrderRequest;
import com.lankanvibe.backend.dto.OrderDto;
import com.lankanvibe.backend.model.*;
import com.lankanvibe.backend.repository.CartRepository;
import com.lankanvibe.backend.repository.CheckoutRepository;
import com.lankanvibe.backend.repository.OrderRepository;
import com.lankanvibe.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * CheckoutService - Business logic for checkout sessions and payment processing
 */
@Service
@Transactional
public class CheckoutService {

    private final CheckoutRepository checkoutRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public CheckoutService(CheckoutRepository checkoutRepository,
                           CartRepository cartRepository,
                           UserRepository userRepository,
                           OrderService orderService,
                           OrderRepository orderRepository) {
        this.checkoutRepository = checkoutRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    // Initiate a checkout session from the current cart
    public CheckoutDto initiateCheckout(String userEmail, CheckoutRequest request) {
        User user = getUser(userEmail);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Cart not found for user"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty, cannot proceed to checkout");
        }

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            total = total.add(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        Checkout checkout = new Checkout();
        checkout.setUser(user);
        checkout.setShippingAddress(request.getShippingAddress());
        checkout.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : Checkout.PaymentMethod.COD);
        checkout.setPaymentStatus(Checkout.PaymentStatus.PENDING);
        checkout.setTotalAmount(total);

        return mapToDto(checkoutRepository.save(checkout));
    }

    // Complete checkout: converts to order and updates payment status
    public CheckoutDto completeCheckout(String userEmail, Long checkoutId) {
        User user = getUser(userEmail);
        Checkout checkout = checkoutRepository.findById(checkoutId)
                .orElseThrow(() -> new IllegalArgumentException("Checkout session not found: " + checkoutId));

        if (!checkout.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized");
        }

        // Create the actual order
        CreateOrderRequest orderReq = new CreateOrderRequest(checkout.getShippingAddress(), checkout.getPaymentMethod().name());
        OrderDto orderDto = orderService.createOrderFromCart(userEmail, orderReq);

        Order order = orderRepository.findById(orderDto.getId()).orElse(null);
        checkout.setOrder(order);
        checkout.setPaymentStatus(checkout.getPaymentMethod() == Checkout.PaymentMethod.COD
                ? Checkout.PaymentStatus.PENDING
                : Checkout.PaymentStatus.PAID);

        return mapToDto(checkoutRepository.save(checkout));
    }

    // Get checkout session details
    @Transactional(readOnly = true)
    public CheckoutDto getCheckout(String userEmail, Long checkoutId) {
        User user = getUser(userEmail);
        Checkout checkout = checkoutRepository.findById(checkoutId)
                .orElseThrow(() -> new IllegalArgumentException("Checkout not found with ID: " + checkoutId));

        if (!checkout.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized");
        }

        return mapToDto(checkout);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    private CheckoutDto mapToDto(Checkout checkout) {
        CheckoutDto dto = new CheckoutDto();
        dto.setId(checkout.getId());
        dto.setUserId(checkout.getUser().getId());
        dto.setOrderId(checkout.getOrder() != null ? checkout.getOrder().getId() : null);
        dto.setShippingAddress(checkout.getShippingAddress());
        dto.setPaymentMethod(checkout.getPaymentMethod());
        dto.setPaymentStatus(checkout.getPaymentStatus());
        dto.setTotalAmount(checkout.getTotalAmount());
        dto.setCreatedAt(checkout.getCreatedAt());
        return dto;
    }
}
