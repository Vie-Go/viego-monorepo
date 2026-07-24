package com.viego.identity.infrastructure.persistence;

import com.viego.identity.domain.Explorer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExplorerRepository extends JpaRepository<Explorer, UUID> {

    boolean existsByHandle(String handle);
}
