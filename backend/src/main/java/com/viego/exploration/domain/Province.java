package com.viego.exploration.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "provinces", schema = "exploration")
public class Province implements Serializable {

    @Id
    @Column(name = "id", length = 16)
    private String id; // ISO Code e.g. VN-HN

    @Column(name = "name_vi", nullable = false, length = 128)
    private String nameVi;

    @Column(name = "name_en", nullable = false, length = 128)
    private String nameEn;

    @Column(name = "beat_count", nullable = false)
    private Long beatCount = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Province() {}

    public Province(String id, String nameVi, String nameEn) {
        this.id = id;
        this.nameVi = nameVi;
        this.nameEn = nameEn;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNameVi() { return nameVi; }
    public void setNameVi(String nameVi) { this.nameVi = nameVi; }
    public String getNameEn() { return nameEn; }
    public void setNameEn(String nameEn) { this.nameEn = nameEn; }
    public Long getBeatCount() { return beatCount; }
    public void setBeatCount(Long beatCount) { this.beatCount = beatCount; }
    public Instant getCreatedAt() { return createdAt; }
}
