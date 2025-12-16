package com.smarthub.repository;

import com.smarthub.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Integer receiverId);
    List<Notification> findByReceiverIdAndStatusOrderByCreatedAtDesc(Integer receiverId, String status);
    Long countByReceiverIdAndStatus(Integer receiverId, String status);
}
