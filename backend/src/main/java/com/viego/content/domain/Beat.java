package com.viego.content.domain;

import com.viego.shared.domain.BaseTsidEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "beats", schema = "content")
public class Beat extends BaseTsidEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "place_id", nullable = false)
    private Long placeId; // Logical ref to exploration.places(id) (TSID)

    @Column(name = "province_id", nullable = false, length = 16)
    private String provinceId; // Logical ref to exploration.provinces(id)

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Column(name = "caption")
    private String caption;

    @Column(name = "audience", nullable = false, length = 16)
    private String audience; // FRIENDS, PUBLIC

    @Column(name = "captured_at", nullable = false, updatable = false)
    private Instant capturedAt = Instant.now();

    public Beat() {}

    public Beat(UUID explorerId, Long placeId, String provinceId, String mediaUrl, String audience) {
        this.explorerId = explorerId;
        this.placeId = placeId;
        this.provinceId = provinceId;
        this.mediaUrl = mediaUrl;
        this.audience = audience;
    }

    public UUID getExplorerId() { return explorerId; }
    public void setExplorerId(UUID explorerId) { this.explorerId = explorerId; }
    public Long getPlaceId() { return placeId; }
    public void setPlaceId(Long placeId) { this.placeId = placeId; }
    public String getProvinceId() { return provinceId; }
    public void setProvinceId(String provinceId) { this.provinceId = provinceId; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }
    public Instant getCapturedAt() { return capturedAt; }
}
