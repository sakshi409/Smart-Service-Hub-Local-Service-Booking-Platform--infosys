package com.smarthub.repository;

import com.smarthub.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByProviderId(Integer providerId);
    List<Review> findByUserId(Integer userId);
}
