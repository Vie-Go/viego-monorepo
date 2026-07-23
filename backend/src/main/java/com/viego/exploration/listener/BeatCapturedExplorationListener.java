package com.viego.exploration.listener;

import com.viego.content.domain.event.BeatCapturedEvent;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
public class BeatCapturedExplorationListener {

    @ApplicationModuleListener
    public void onBeatCaptured(BeatCapturedEvent event) {
        // Unlock province for explorer in exploration.collections schema
    }
}
