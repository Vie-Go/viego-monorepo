# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users
Travelers and locals exploring Vietnam who want to capture where they go, keep a daily habit going, and see where their friends are — province by province.

## Product Purpose
VieGo is a social capture app for Vietnam: point the camera at something worth remembering — a bowl of phở, a pagoda, a mountain pass — and that photo (a **Beat**) auto-tags its location, keeps your daily streak alive, unlocks the province you're in, and lands on your friends' maps and feeds.

## Positioning
BeReal × a living map of Vietnam. A daily photo check-in ("one Beat a day") that combines an interactive province map, streaks, province unlocking, and a friends-first social feed — real captures from real travelers, not a travel blog.

## Operating Context
Mobile application used on-the-go while traveling or during daily rituals. The core loop is: open camera → capture a Beat → it auto-tags the place → send to friends or post publicly → streak grows, province unlocks, friends see it live on the map.

## Capabilities and Constraints
- **Capabilities**: In-app camera capture with automatic location tagging; interactive Vietnam map with province/ward metadata and public check-in heat (`provinces-metadata.json`, `vietnam-provinces.geojson`); places (POIs) with local context, community Beats, and reviews; daily streak counters with milestones/badges; a friends-first feed plus a public Discover feed; friend invites via shareable link/QR (`viego.app/add/@handle`); personal Memories history; multi-language support (Vietnamese, English, Korean, Japanese, French); authentication (Email, Google, Facebook, Zalo); dark/light theme switching.
- **Technical Constraints**: Target native mobile app components (iOS / Android adaptive) with responsive mobile ergonomics; camera + location permissions; location is hidden outside Vietnam.
- **Terminology**: Beat (photo check-in), Capture, Audience (Friends/Public), Streak, Milestone/Badge, Province unlocking, Collection, Place (POI), Feed, Discover, Reaction, Memories, Handle.

## Brand Commitments
- **Name**: VieGo
- **Palette**: Signature deep crimson red (`#BE382A`), warm vibrant yellow/gold (`#F2B72F`), warm off-white canvas (`#EBE5DC` / `#F6F3EE`), sleek dark theme (`#151011`).
- **Typography**: Urbanist font family with bold geometric weights (800 / 700 / 600).
- **Tone & Voice**: Warm, vibrant, culturally proud, encouraging, and playful.

## Evidence on Hand
- Working interactive prototype in [VieGo.dc.html](file:///d:/Projects/viego-docs/prototype/VieGo.dc.html) — the authoritative reference for product logic, screens, and features (language pick → auth → add-friends → onboarding → capture/beat loop → map → feed → discover → profile). Component schemas and iOS frame wrapper included.
- Geographical & metadata datasets: [provinces-metadata.json](file:///d:/Projects/viego-docs/prototype/data/provinces-metadata.json), [vietnam-provinces.geojson](file:///d:/Projects/viego-docs/prototype/data/vietnam-provinces.geojson), [vietnam-map.svg](file:///d:/Projects/viego-docs/prototype/data/vietnam-map.svg).
- Component assets: [icons.js](file:///d:/Projects/viego-docs/prototype/icons.js), [vn-map.js](file:///d:/Projects/viego-docs/prototype/vn-map.js), [support.js](file:///d:/Projects/viego-docs/prototype/support.js), [ios-frame.jsx](file:///d:/Projects/viego-docs/prototype/ios-frame.jsx).

## Product Principles
1. **Real Beats, Not a Blog**: Everything on the map is a real capture from a real person, verified by location — social proof over editorial.
2. **Capture-First Daily Ritual**: One Beat a day is the heartbeat — the whole loop (streak, unlock, feed) hangs off a single tap of the shutter.
3. **Friends-First, Then the World**: Sharing to friends is the default; posting publicly is a deliberate, second choice.
4. **Cultural Pride First**: Celebrate Vietnam's regional diversity authentically — including its seas and islands (Hoàng Sa, Trường Sa).
5. **Tactile Mobile Ergonomics**: Fluid single-handed navigation with micro-animations and crisp tactile feedback; frictionless language/theme switching.

## Accessibility & Inclusion
Ensure high color contrast ratios for both light (`#BE382A` on `#FFFFFF`) and dark themes, multi-language support (Vietnamese & English priority), clear touch targets (>44px), and readable typography across screen sizes.

## Privacy Commitments
- **Location is precise only inside Vietnam.** When an Explorer is outside Vietnam, their live location is hidden ("Ngoài Việt Nam — vị trí ẩn") and Beats are not pinned to a precise point.
- **Friends-first by default.** A Beat's audience is an explicit choice; Friends is the default, Public is opt-in per capture.
- **No stored passwords.** VieGo is an OIDC relying party — it never stores credentials.
