package com.lankanvibe.backend.repository;

import com.lankanvibe.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Product Repository - Repository interface for database operations on products
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(String category);

    List<Product> findByIsActiveTrue();

    List<Product> findByCategoryAndIsActiveTrue(String category);
}
