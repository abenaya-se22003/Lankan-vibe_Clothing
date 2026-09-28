package com.lankanvibe.backend.controller;

import com.lankanvibe.backend.dto.CheckoutDto;
import com.lankanvibe.backend.dto.CheckoutRequest;
import com.lankanvibe.backend.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * CheckoutController - REST API endpoints for checkout transactions
 */
@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    // POST /api/checkout - Start checkout session
    @PostMapping
    public ResponseEntity<CheckoutDto> initiateCheckout(@AuthenticationPrincipal UserDetails userDetails,
                                                        @Valid @RequestBody CheckoutRequest request) {
        CheckoutDto dto = checkoutService.initiateCheckout(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // POST /api/checkout/{id}/complete - Finalize payment and convert to order
    @PostMapping("/{id}/complete")
    public ResponseEntity<CheckoutDto> completeCheckout(@AuthenticationPrincipal UserDetails userDetails,
                                                        @PathVariable Long id) {
        return ResponseEntity.ok(checkoutService.completeCheckout(userDetails.getUsername(), id));
    }

    // GET /api/checkout/{id} - Get checkout session status
    @GetMapping("/{id}")
    public ResponseEntity<CheckoutDto> getCheckout(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable Long id) {
        return ResponseEntity.ok(checkoutService.getCheckout(userDetails.getUsername(), id));
    }
}
