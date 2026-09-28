package com.lankanvibe.backend.repository;

import com.lankanvibe.backend.model.Checkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Checkout Repository - Repository interface for checkout transactions
 */
@Repository
public interface CheckoutRepository extends JpaRepository<Checkout, Long> {

    List<Checkout> findByUserId(Long userId);

    Optional<Checkout> findByOrderId(Long orderId);
}
