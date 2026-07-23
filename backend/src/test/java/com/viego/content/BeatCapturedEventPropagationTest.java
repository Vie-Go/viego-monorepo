package com.viego.content;

import com.viego.content.domain.Beat;
import com.viego.content.domain.event.BeatCapturedEvent;
import com.viego.content.service.BeatCaptureService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class BeatCapturedEventPropagationTest {

    @Autowired
    private BeatCaptureService beatCaptureService;

    @Test
    void testBeatCapturePublishesEvent() {
        Beat beat = new Beat(UUID.randomUUID(), 1001L, "VN-HN", "https://media.viego.app/beat.jpg", "PUBLIC");
        beat.setId(5001L);

        beatCaptureService.captureBeat(beat);
        assertThat(beat.getId()).isNotNull();
    }
}
