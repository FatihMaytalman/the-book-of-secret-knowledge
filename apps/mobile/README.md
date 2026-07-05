# AOM Legacy Mobile App

Planned stack: **React Native**, **Expo**, and native modules where background media sync requires platform-specific behavior.

## Phase 1 mobile decision

Use the Immich mobile app first for reliable camera roll backup over Tailscale. The AOM Legacy mobile app should begin with family workflows that Immich does not own:

- family dashboard,
- person profiles,
- voice story capture,
- duplicate review,
- face tag confirmation,
- comments and memories,
- approval workflows,
- backup health visibility for admins.

## Future native sync module

When AOM Legacy owns upload directly, the mobile app must support:

- background camera roll scanning,
- WiFi-only or WiFi plus mobile-data policies,
- resumable uploads,
- local upload manifests,
- battery-aware scheduling,
- pre-upload hashing where practical,
- private notifications,
- secure token storage,
- biometric app lock.
