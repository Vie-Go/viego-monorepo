package com.viego.shared.domain;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UuidGenerator;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * MappedSuperclass for entities using UUIDv7 (RFC 9562) primary keys.
 *
 * <p>UUIDv7 is time-ordered: a 48-bit millisecond timestamp followed by 74 random bits. The
 * time prefix keeps B-tree inserts at the right edge of the index (no page splits, no bloat),
 * while the random suffix keeps ids unguessable and collision-free without any per-instance
 * node configuration. Every module uses this single key type — see ADR-0014.
 *
 * <p>{@code equals}/{@code hashCode} are written by hand on purpose: entity identity is the
 * primary key alone, so Lombok's {@code @EqualsAndHashCode} (and {@code @Data}, which implies
 * it) must never be used on an entity.
 */
@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public abstract class BaseEntity implements Serializable {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BaseEntity that = (BaseEntity) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
