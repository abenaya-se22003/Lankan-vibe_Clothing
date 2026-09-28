package com.lankanvibe.backend.service;

import com.lankanvibe.backend.dto.CartDto;
import com.lankanvibe.backend.dto.CartItemDto;
import com.lankanvibe.backend.model.Cart;
import com.lankanvibe.backend.model.CartItem;
import com.lankanvibe.backend.model.Product;
import com.lankanvibe.backend.model.User;
import com.lankanvibe.backend.repository.CartItemRepository;
import com.lankanvibe.backend.repository.CartRepository;
import com.lankanvibe.backend.repository.ProductRepository;
import com.lankanvibe.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * CartService - Business logic for user shopping cart
 */
@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       UserRepository userRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // Get or initialize cart for user
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    // Fetch user's cart as DTO
    @Transactional(readOnly = true)
    public CartDto getCart(String userEmail) {
        User user = getUser(userEmail);
        Cart cart = getOrCreateCart(user);
        return mapToCartDto(cart);
    }

    // Add product to user's cart
    public CartDto addToCart(String userEmail, Long productId, int quantity) {
        User user = getUser(userEmail);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        return getCart(userEmail);
    }

    // Update quantity of an item
    public CartDto updateItemQuantity(String userEmail, Long itemId, int quantity) {
        User user = getUser(userEmail);
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Item does not belong to user cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCart(userEmail);
    }

    // Remove single item from cart
    public CartDto removeItem(String userEmail, Long itemId) {
        return updateItemQuantity(userEmail, itemId, 0);
    }

    // Clear entire cart
    public CartDto clearCart(String userEmail) {
        User user = getUser(userEmail);
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
        return mapToCartDto(cart);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    private CartDto mapToCartDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());

        List<CartItemDto> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        int count = 0;

        for (CartItem item : cart.getItems()) {
            Product p = item.getProduct();
            CartItemDto itemDto = new CartItemDto(
                    item.getId(),
                    p.getId(),
                    p.getName(),
                    p.getPrice(),
                    p.getImageUrl(),
                    item.getQuantity()
            );
            items.add(itemDto);
            total = total.add(itemDto.getSubtotal());
            count += item.getQuantity();
        }

        dto.setItems(items);
        dto.setTotalAmount(total);
        dto.setTotalQuantity(count);
        return dto;
    }
}
