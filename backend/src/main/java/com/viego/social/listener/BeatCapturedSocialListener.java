package com.viego.social.listener;

import com.viego.content.domain.event.BeatCapturedEvent;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
public class BeatCapturedSocialListener {

    @ApplicationModuleListener
    public void onBeatCaptured(BeatCapturedEvent event) {
        // Fan out feed entry to social.feed_entries schema
    }
}
