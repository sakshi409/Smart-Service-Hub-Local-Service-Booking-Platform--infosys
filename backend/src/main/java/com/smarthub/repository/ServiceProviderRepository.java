package com.smarthub.repository;

import com.smarthub.entity.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Integer> {
    Optional<ServiceProvider> findByHomeId(Integer homeId);
    List<ServiceProvider> findByServiceTypeContainingIgnoreCase(String serviceType);
    List<ServiceProvider> findByLocationContainingIgnoreCase(String location);
    List<ServiceProvider> findByServiceTypeContainingIgnoreCaseAndLocationContainingIgnoreCase(
        String serviceType, String location);
}
