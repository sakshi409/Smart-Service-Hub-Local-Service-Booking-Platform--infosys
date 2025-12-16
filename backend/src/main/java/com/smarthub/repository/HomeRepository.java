package com.smarthub.repository;

import com.smarthub.entity.Home;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HomeRepository extends JpaRepository<Home, Integer> {
    Optional<Home> findByMobileAndPasswordAndRole(String mobile, String password, Home.Role role);
    Optional<Home> findByMobile(String mobile);
    Optional<Home> findByEmail(String email);
    boolean existsByMobile(String mobile);
    boolean existsByEmail(String email);
}
