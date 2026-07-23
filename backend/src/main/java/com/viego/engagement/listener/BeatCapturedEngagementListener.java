package com.viego.engagement.listener;

import com.viego.content.api.BeatCapturedEvent;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
public class BeatCapturedEngagementListener {

    @ApplicationModuleListener
    public void onBeatCaptured(BeatCapturedEvent event) {
        // Increment streak count in engagement.streaks schema
    }
}
