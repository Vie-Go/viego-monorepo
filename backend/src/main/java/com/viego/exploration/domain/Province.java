package com.viego.exploration.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A Vietnamese province. Reference data keyed by its natural ISO administrative code
 * rather than a generated key — see ADR-0014.
 */
@Entity
@Table(name = "provinces", schema = "exploration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Province implements Serializable {

    @Id
    @Column(name = "id", length = 16)
    private String id; // ISO Code e.g. VN-HN

    @Column(name = "name_vi", nullable = false, length = 128)
    private String nameVi;

    @Column(name = "name_en", nullable = false, length = 128)
    private String nameEn;

    @Builder.Default
    @Column(name = "beat_count", nullable = false)
    private Long beatCount = 0L;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Province(String id, String nameVi, String nameEn) {
        this.id = id;
        this.nameVi = nameVi;
        this.nameEn = nameEn;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Province province = (Province) o;
        return id != null && Objects.equals(id, province.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
