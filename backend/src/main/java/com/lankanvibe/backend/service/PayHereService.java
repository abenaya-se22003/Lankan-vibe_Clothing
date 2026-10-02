package com.lankanvibe.backend.service;

import com.lankanvibe.backend.dto.PayHereInitiateRequest;
import com.lankanvibe.backend.dto.PayHereInitiateResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

/**
 * PayHereService - Handles PayHere payment checkout initiation, hash generation, and callback verification
 */
@Service
public class PayHereService {

    private static final Logger log = LoggerFactory.getLogger(PayHereService.class);

    @Value("${payhere.merchant-id:4OVzEdMqDXU4JH5Y5BGnKA3D0}")
    private String merchantId;

    @Value("${payhere.merchant-secret:4JDDSALstIU8Qh7pA7WSDl4TnPep0Vp1l4jrvrG9h4D9}")
    private String merchantSecret;

    @Value("${payhere.checkout-url:https://sandbox.payhere.lk/pay/checkout}")
    private String checkoutUrl;

    @Value("${payhere.mode:sandbox}")
    private String mode;

    /**
     * Prepares PayHere checkout parameters and secure hash
     */
    public PayHereInitiateResponse initiatePayment(PayHereInitiateRequest request, String userEmail) {
        String cleanMerchantId = (merchantId != null ? merchantId.trim() : "4OVzEdMqDXU4JH5Y5BGnKA3D0");
        String cleanMerchantSecret = (merchantSecret != null ? merchantSecret.trim() : "4JDDSALstIU8Qh7pA7WSDl4TnPep0Vp1l4jrvrG9h4D9");

        String orderId = request.getOrderId();
        if (orderId == null || orderId.trim().isEmpty()) {
            orderId = "LV-" + System.currentTimeMillis();
        } else {
            orderId = orderId.trim();
        }

        BigDecimal amount = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;
        String currency = (request.getCurrency() != null && !request.getCurrency().trim().isEmpty())
                ? request.getCurrency().trim()
                : "LKR";

        DecimalFormat df = new DecimalFormat("0.00", DecimalFormatSymbols.getInstance(Locale.US));
        String formattedAmount = df.format(amount);

        String hash = generateHash(cleanMerchantId, orderId, formattedAmount, currency, cleanMerchantSecret);

        PayHereInitiateResponse response = new PayHereInitiateResponse();
        response.setActionUrl(checkoutUrl);
        response.setMerchantId(cleanMerchantId);
        response.setOrderId(orderId);
        response.setAmount(formattedAmount);
        response.setCurrency(currency);
        response.setHash(hash);
        response.setSandbox("true");

        response.setItems(request.getItems() != null ? request.getItems() : "Lankan Vibe Apparel");
        response.setFirstName(request.getFirstName() != null ? request.getFirstName() : "Valued");
        response.setLastName(request.getLastName() != null ? request.getLastName() : "Customer");
        response.setEmail(request.getEmail() != null ? request.getEmail() : (userEmail != null ? userEmail : "customer@lankanvibe.com"));
        response.setPhone(request.getPhone() != null ? request.getPhone() : "0771234567");
        response.setAddress(request.getAddress() != null ? request.getAddress() : "Colombo");
        response.setCity(request.getCity() != null ? request.getCity() : "Colombo");
        response.setCountry(request.getCountry() != null ? request.getCountry() : "Sri Lanka");

        response.setReturnUrl(request.getReturnUrl() != null ? request.getReturnUrl() : "http://localhost:5173/checkout?status=success&orderId=" + orderId);
        response.setCancelUrl(request.getCancelUrl() != null ? request.getCancelUrl() : "http://localhost:5173/checkout?status=cancelled");
        response.setNotifyUrl("http://localhost:5000/api/payment/payhere/notify");

        log.info("Initiated PayHere checkout for orderId={}, amount={} {}, merchantId={}",
                orderId, formattedAmount, currency, cleanMerchantId);

        return response;
    }

    /**
     * PayHere Hash generation formula:
     * hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
     */
    public String generateHash(String merchantId, String orderId, String formattedAmount, String currency, String merchantSecret) {
        String hashedSecret = md5(merchantSecret.trim()).toUpperCase();
        String rawString = merchantId.trim() + orderId.trim() + formattedAmount.trim() + currency.trim() + hashedSecret;
        return md5(rawString).toUpperCase();
    }

    /**
     * Verify PayHere notification callback signature:
     * md5sig = strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
     */
    public boolean verifyNotification(String merchantIdParam, String orderId, String payhereAmount,
                                      String payhereCurrency, String statusCode, String md5sig) {
        String cleanMerchantSecret = (merchantSecret != null ? merchantSecret.trim() : "");
        String hashedSecret = md5(cleanMerchantSecret).toUpperCase();
        String rawString = merchantIdParam.trim() + orderId.trim() + payhereAmount.trim() +
                payhereCurrency.trim() + statusCode.trim() + hashedSecret;
        String localHash = md5(rawString).toUpperCase();
        return localHash.equalsIgnoreCase(md5sig);
    }

    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm unavailable", e);
        }
    }
}
