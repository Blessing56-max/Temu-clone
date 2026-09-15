package com.kora.repository;

import com.kora.entity.Role;
import com.kora.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByRole(Role role);
}