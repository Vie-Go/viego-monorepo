package com.viego.exploration.domain;

import com.viego.shared.domain.BaseTsidEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "places", schema = "exploration")
public class Place extends BaseTsidEntity {

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

    @Column(name = "rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    public Place() {}

    public String getProvinceId() { return provinceId; }
    public void setProvinceId(String provinceId) { this.provinceId = provinceId; }
    public String getWardId() { return wardId; }
    public void setWardId(String wardId) { this.wardId = wardId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescriptionVi() { return descriptionVi; }
    public void setDescriptionVi(String descriptionVi) { this.descriptionVi = descriptionVi; }
    public String getDescriptionEn() { return descriptionEn; }
    public void setDescriptionEn(String descriptionEn) { this.descriptionEn = descriptionEn; }
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
}
