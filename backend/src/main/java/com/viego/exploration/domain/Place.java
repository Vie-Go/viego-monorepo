package com.viego.exploration.domain;

import com.viego.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "places", schema = "exploration")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Place extends BaseEntity {

    @Column(name = "province_id", nullable = false, length = 16)
    private String provinceId;

    @Column(name = "ward_id", length = 16)
    private String wardId;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "category", nullable = false, length = 32)
    private String category;

    @Column(name = "description_vi")
    private String descriptionVi;

    @Column(name = "description_en")
    private String descriptionEn;

    @Builder.Default
    @Column(name = "rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;
}
