package com.webpurchase.modules.order.domain.repository;

import com.webpurchase.modules.order.domain.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findWithItemsByOrderCode(String orderCode);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findWithItemsById(Long id);

    @EntityGraph(attributePaths = {"items"})
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    Page<Order> findAll(Pageable pageable);

    long countByStatus(String status);
}
