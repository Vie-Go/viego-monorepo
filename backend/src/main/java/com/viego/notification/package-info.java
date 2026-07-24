/**
 * The Notification bounded context — the system's single **delivery sink**.
 *
 * <p>Notification is a pure fan-in consumer: peers publish what happened, and this module decides
 * whether it is worth telling the Explorer about and through which channel (in-app feed, push).
 * The dependency arrow therefore points **into** this module and never out of it — no peer may
 * depend on {@code com.viego.notification}, which is what keeps "notify the user" from leaking
 * into every other context.
 *
 * <p>{@code allowedDependencies} lists only the peers whose events are consumed today. It grows as
 * publishers land: Exploration ({@code ProvinceUnlocked}) in P2 and Social ({@code FriendAdded},
 * {@code BeatReacted}) in P5.
 */
@org.springframework.modulith.ApplicationModule(
		displayName = "Notification",
		allowedDependencies = {"shared", "engagement::api"})
package com.viego.notification;
