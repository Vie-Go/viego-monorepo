package com.viego.shared.domain;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import io.hypersistence.tsid.TSID;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * MappedSuperclass for entities using 64-bit TSID (Time-Sorted Unique Identifier) primary keys.
 * Uses 8 bytes storage in PostgreSQL BIGINT columns.
 */
@MappedSuperclass
public abstract class BaseTsidEntity implements Serializable {

    @Id
    private Long id;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = TSID.fast().toLong();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BaseTsidEntity that = (BaseTsidEntity) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
