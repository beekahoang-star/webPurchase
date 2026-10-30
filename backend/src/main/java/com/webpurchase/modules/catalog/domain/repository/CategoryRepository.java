package com.webpurchase.modules.catalog.domain.repository;

import com.webpurchase.modules.catalog.domain.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @EntityGraph(attributePaths = {"children"})
    List<Category> findByParentIsNullAndActiveTrueOrderBySortOrderAsc();

    @EntityGraph(attributePaths = {"parent", "children"})
    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
