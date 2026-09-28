package com.lankanvibe.backend.service;

import com.lankanvibe.backend.dto.CreateOrderRequest;
import com.lankanvibe.backend.dto.OrderDto;
import com.lankanvibe.backend.dto.OrderItemDto;
import com.lankanvibe.backend.model.*;
import com.lankanvibe.backend.repository.CartRepository;
import com.lankanvibe.backend.repository.OrderRepository;
import com.lankanvibe.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * OrderService - Business logic for customer orders and admin order tracking
 */
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    // Place an order from the user's current cart
    public OrderDto createOrderFromCart(String userEmail, CreateOrderRequest request) {
        User user = getUser(userEmail);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Cart not found for user"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot place an order with an empty cart");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(Order.Status.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getProduct().getPrice());

            BigDecimal lineTotal = cartItem.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            orderItem.setTotalPrice(lineTotal);

            orderItems.add(orderItem);
            total = total.add(lineTotal);
        }

        order.setTotalAmount(total);
        order.setOrderItems(orderItems);

        Order saved = orderRepository.save(order);

        // Clear cart after successful order creation
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToOrderDto(saved);
    }

    // Customer: Get my orders
    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(String userEmail) {
        User user = getUser(userEmail);
        return orderRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToOrderDto)
                .toList();
    }

    // Customer / Admin: Get order details by ID
    @Transactional(readOnly = true)
    public OrderDto getOrderById(String userEmail, Long orderId) {
        User user = getUser(userEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this order");
        }

        return mapToOrderDto(order);
    }

    // Admin: Get all orders
    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToOrderDto)
                .toList();
    }

    // Admin: Update order status
    public OrderDto updateOrderStatus(Long orderId, Order.Status status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
        order.setStatus(status);
        return mapToOrderDto(orderRepository.save(order));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    private OrderDto mapToOrderDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUserEmail(order.getUser().getEmail());
        dto.setCustomerName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setOrderDate(order.getOrderDate());

        List<OrderItemDto> itemDtos = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem oi : order.getOrderItems()) {
                itemDtos.add(new OrderItemDto(
                        oi.getId(),
                        oi.getProduct().getId(),
                        oi.getProduct().getName(),
                        oi.getQuantity(),
                        oi.getUnitPrice(),
                        oi.getTotalPrice()
                ));
            }
        }
        dto.setItems(itemDtos);
        return dto;
    }
}
