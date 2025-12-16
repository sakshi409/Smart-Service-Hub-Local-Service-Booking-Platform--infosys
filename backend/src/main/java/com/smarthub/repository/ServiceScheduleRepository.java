package com.smarthub.repository;

import com.smarthub.entity.ServiceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceScheduleRepository extends JpaRepository<ServiceSchedule, Integer> {
    List<ServiceSchedule> findByProviderId(Integer providerId);
}
