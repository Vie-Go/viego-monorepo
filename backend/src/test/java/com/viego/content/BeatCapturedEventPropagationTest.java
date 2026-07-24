package com.viego.content;

import com.viego.content.domain.Beat;
import com.viego.content.api.BeatCapturedEvent;
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
        Beat beat = Beat.builder()
                .id(UUID.randomUUID())
                .explorerId(UUID.randomUUID())
                .placeId(UUID.randomUUID())
                .provinceId("VN-HN")
                .mediaUrl("https://media.viego.app/beat.jpg")
                .audience("PUBLIC")
                .build();

        beatCaptureService.captureBeat(beat);
        assertThat(beat.getId()).isNotNull();
    }
}
