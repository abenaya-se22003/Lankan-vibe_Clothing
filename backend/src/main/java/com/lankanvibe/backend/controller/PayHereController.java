package com.lankanvibe.backend.controller;

import com.lankanvibe.backend.dto.PayHereInitiateRequest;
import com.lankanvibe.backend.dto.PayHereInitiateResponse;
import com.lankanvibe.backend.service.PayHereService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * PayHereController - REST API endpoints for PayHere checkout integration
 */
@RestController
@RequestMapping("/api/payment/payhere")
@CrossOrigin(origins = "*")
public class PayHereController {

    private static final Logger log = LoggerFactory.getLogger(PayHereController.class);

    private final PayHereService payHereService;

    public PayHereController(PayHereService payHereService) {
        this.payHereService = payHereService;
    }

    /**
     * POST /api/payment/payhere/initiate
     * Generates PayHere parameters, action URL, and MD5 hash for client-side redirection
     */
    @PostMapping("/initiate")
    public ResponseEntity<PayHereInitiateResponse> initiatePayHere(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PayHereInitiateRequest request) {

        String userEmail = userDetails != null ? userDetails.getUsername() : request.getEmail();
        PayHereInitiateResponse response = payHereService.initiatePayment(request, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/payment/payhere/notify
     * Webhook IPN listener called by PayHere servers upon payment completion
     */
    @PostMapping("/notify")
    public ResponseEntity<String> handlePayHereNotification(@RequestParam Map<String, String> params) {
        log.info("Received PayHere notification: {}", params);

        String merchantId = params.get("merchant_id");
        String orderId = params.get("order_id");
        String payhereAmount = params.get("payhere_amount");
        String payhereCurrency = params.get("payhere_currency");
        String statusCode = params.get("status_code");
        String md5sig = params.get("md5sig");

        if (merchantId != null && orderId != null && md5sig != null) {
            boolean isValid = payHereService.verifyNotification(
                    merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig);

            if (isValid) {
                log.info("PayHere notification verified successfully for orderId={}, statusCode={}",
                        orderId, statusCode);
                // Status 2 = SUCCESS in PayHere
                if ("2".equals(statusCode)) {
                    log.info("Order {} marked as PAID via PayHere", orderId);
                }
                return ResponseEntity.ok("OK");
            } else {
                log.warn("Invalid PayHere signature for orderId={}", orderId);
            }
        }

        return ResponseEntity.badRequest().body("Signature verification failed");
    }
}
