package com.lankanvibe.backend.controller;

import com.lankanvibe.backend.dto.AddToCartRequest;
import com.lankanvibe.backend.dto.CartDto;
import com.lankanvibe.backend.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * CartController - REST API endpoints for user shopping cart
 */
@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // GET /api/cart - Get current authenticated user's cart
    @GetMapping
    public ResponseEntity<CartDto> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCart(userDetails.getUsername()));
    }

    // POST /api/cart/items - Add item to cart
    @PostMapping("/items")
    public ResponseEntity<CartDto> addToCart(@AuthenticationPrincipal UserDetails userDetails,
                                            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(userDetails.getUsername(), request.getProductId(), request.getQuantity()));
    }

    // PUT /api/cart/items/{itemId} - Update item quantity
    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateItemQuantity(@AuthenticationPrincipal UserDetails userDetails,
                                                      @PathVariable Long itemId,
                                                      @RequestBody Map<String, Integer> payload) {
        int quantity = payload.getOrDefault("quantity", 1);
        return ResponseEntity.ok(cartService.updateItemQuantity(userDetails.getUsername(), itemId, quantity));
    }

    // DELETE /api/cart/items/{itemId} - Remove item from cart
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeItem(@AuthenticationPrincipal UserDetails userDetails,
                                              @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(userDetails.getUsername(), itemId));
    }

    // DELETE /api/cart - Clear all items in cart
    @DeleteMapping
    public ResponseEntity<CartDto> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.clearCart(userDetails.getUsername()));
    }
}
