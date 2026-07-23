package com.viego.content.service;

import com.viego.content.domain.Beat;
import com.viego.content.domain.event.BeatCapturedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BeatCaptureService {

    private final ApplicationEventPublisher eventPublisher;

    public BeatCaptureService(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void captureBeat(Beat beat) {
        // Publish domain event to Spring Modulith event bus
        BeatCapturedEvent event = new BeatCapturedEvent(
                beat.getId(),
                beat.getExplorerId(),
                beat.getPlaceId(),
                beat.getProvinceId(),
                beat.getMediaUrl(),
                beat.getCapturedAt()
        );
        eventPublisher.publishEvent(event);
    }
}
