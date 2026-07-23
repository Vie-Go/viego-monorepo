package com.viego.exploration.listener;

import com.viego.content.api.BeatCapturedEvent;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
public class BeatCapturedExplorationListener {

    @ApplicationModuleListener
    public void onBeatCaptured(BeatCapturedEvent event) {
        // Unlock province for explorer in exploration.collections schema
    }
}
