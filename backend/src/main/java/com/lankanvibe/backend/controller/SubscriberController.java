package com.lankanvibe.backend.controller;

import com.lankanvibe.backend.model.Subscriber;
import com.lankanvibe.backend.repository.SubscriberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * SubscriberController - Handles newsletter subscription endpoints
 */
@RestController
@RequestMapping("/api/subscribers")
@CrossOrigin(origins = "*")
public class SubscriberController {

    private final SubscriberRepository subscriberRepository;

    public SubscriberController(SubscriberRepository subscriberRepository) {
        this.subscriberRepository = subscriberRepository;
    }

    // POST /api/subscribers - Subscribe with an email address (public)
    @PostMapping
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        if (subscriberRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already subscribed"));
        }
        Subscriber subscriber = new Subscriber();
        subscriber.setEmail(email);
        subscriberRepository.save(subscriber);
        return ResponseEntity.ok(Map.of("message", "Successfully subscribed!"));
    }

    // GET /api/subscribers - Admin: list all subscribers
    @GetMapping
    public ResponseEntity<?> getAllSubscribers() {
        return ResponseEntity.ok(subscriberRepository.findAll());
    }
}
