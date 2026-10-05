# WalkTrip Android-First Product and Engineering Plan

## Purpose

Build a dependable first release of WalkTrip: a running app that records a user's run, saves it on the phone, and lets the user review past activities. The first release targets Android. iOS is a later platform; keep core run data and calculations portable where practical, but do not spend v1 effort on iOS-specific implementation or testing.

This plan is based on the product brief supplied by the founder and the decisions made during review:

- Reliable recording and honest accuracy feedback matter more than perfect GPS accuracy.
- A run should work without internet.
- Location points should be saved locally as they arrive to support recovery.
- Android tracking should be user-started and visible through a persistent notification.
- Explain GPS battery use before the first run and warn about low battery before a run when useful.
- Do not claim that a run will survive every force-stop, device restart, or manufacturer-specific process kill.
- Defer social, AI coaching, training plans, wearables, and other expansion features.

## Current project baseline

- Expo SDK 57, React Native 0.86, TypeScript, and Expo Router are already present.
- Routes live under `src/app/`; non-route code belongs outside that directory.
- The repository currently has a small Expo Router scaffold. Location, SQLite, maps, authentication, and sync dependencies have not yet been added.
- Use `npx expo install` for Expo packages. Before implementing Expo or React Native APIs, read the SDK 57 documentation and the package's SDK 57 reference.
- Native Android and iOS folders are not present. Keep native configuration in `app.json` and config plugins; do not hand-create generated native folders.

## Product definition

### Target user

Someone who wants to start a run quickly, put their Android phone away, and later see a useful record of the route, duration, distance, and pace.

### Core user journey

1. Open the app and see a prominent **Start run** action.
2. The app checks location access and location services and explains anything the user needs to fix.
3. Before the first run, show a concise disclosure that location is used during an active run, including while the app is in the background, and that GPS can use additional battery. Ask for the required Android permission only in context.
4. The user starts a run. Tracking becomes visible in an ongoing Android notification.
5. The user can pause, resume, finish, or discard the run.
6. The app shows a summary, saves the activity locally, and makes it available in history without requiring a network connection.
7. When signed in and online, the app can synchronize the activity. A failed sync remains retryable and must not create a duplicate run.

### MVP scope

**Required**

- Android run start, pause, resume, finish, and discard.
- Location-based route recording and distance, elapsed time, current/average pace, and speed where data quality supports them.
- Active-run status and a persistent tracking notification.
- Local durable run and point storage, plus interrupted-run recovery when the app is reopened and saved data is available.
- Run summary, history list, and run detail with route visualization.
- Clear GPS-quality and permission/service states; save useful data even when the GPS fix is imperfect.
- Offline operation for recording, saving, history, and review.
- Battery disclosure before first run and a low-battery warning before starting when available.
- Private-by-default account and cloud sync if authentication/sync are included in the first public release.

**Defer**

- iOS release work and iOS-specific tracking implementation.
- Social feed, followers, likes, public activities, clubs, challenges, and leaderboards.
- AI coaching, generated insights, and training plans.
- Wearable integrations, Health Connect, advanced goals, achievements, and monetization.
- Map matching and elaborate GPS smoothing until field data shows a clear need.
- Elevation and calorie estimates unless they can be presented with a clear uncertainty label and do not delay reliable tracking.

## Product and engineering decisions

### Android tracking

- Start tracking from an explicit user action while the app is visible.
- Use an Android location foreground service for an active run, with an ongoing notification that clearly indicates tracking and provides a path back to the active run.
- Request only the location permissions needed for the selected tracking design. Review the current Expo SDK 57 and Google Play guidance before choosing whether `ACCESS_BACKGROUND_LOCATION` is needed in addition to foreground location and a location foreground service.
- Stop the service promptly when the run is finished or discarded.
- Explain that Android manufacturers and system settings can interrupt tracking. Detect a stale location stream when possible and show a recovery/status message rather than silently presenting stale pace or distance.
- Treat a force-stop, OS kill, or battery exhaustion as a possible interruption. Preserve committed local points, recover a draft on next launch, and explain the gap honestly.

### GPS quality and metrics

- Record the location samples delivered by the platform with coordinates, timestamp, reported accuracy, and available speed/altitude metadata.
- Keep received samples for local recovery and diagnostics, subject to a defined retention and privacy policy. Do not upload diagnostic raw data without a product need and user disclosure.
- Use quality checks for missing/stale samples, poor accuracy, impossible time/distance jumps, and implausible speeds. Treat proposed values such as a 50 m accuracy cutoff or 12 m/s speed cutoff as tunable starting points, not validated guarantees.
- Separate recorded samples from samples accepted into distance calculations. Exclude obvious outliers from distance while preserving enough information to investigate them.
- Do not fabricate or aggressively smooth a route to make it look accurate. Tell the user when GPS quality can affect the route or distance.
- Calculate elapsed time from timestamps and subtract paused intervals. Calculate average pace from moving time and accepted distance; avoid showing unstable current pace when recent fixes are stale or poor.
- Calibrate thresholds using replayed traces and outdoor runs across representative Android devices and environments.

### Local data and recovery

- Use SQLite for runs, state transitions, and ordered GPS points. Commit each received point promptly; batch writes only if measurements show a need and the recovery tradeoff is understood.
- Persist run state (`recording`, `paused`, `finished`, `discarded`), timestamps, pause intervals, and sync state so process restarts do not leave the UI guessing.
- Keep all run capture and viewing usable offline. Network state must never gate starting or saving a run.
- Define storage cleanup and account deletion behavior before cloud release. Never silently delete an unsynced activity to reclaim space.

### Cloud and authentication

- Proposed direction: Supabase Auth and PostgreSQL for accounts and run summaries, with row-level security so a user can access only their own data.
- Keep backend choice and route upload format as Phase 0 decisions. Validate current pricing, data residency, RLS behavior, export/deletion needs, and upload/retry behavior before implementation.
- Keep relational run metadata in PostgreSQL. Choose between a route object in object storage and a compact encoded route representation after measuring realistic route sizes and sync needs. Avoid putting large per-point histories into relational rows solely because the schema example did so, and avoid committing to JSON blobs without validating partial upload and recovery behavior.
- Make uploads idempotent with a stable client-generated run ID. Save locally first; upload summary and route with retryable states; mark synced only after the server confirms the complete activity.
- Keep route data private by default. Do not include precise routes in product analytics.

### Maps

- Compare supported Android mapping options before implementation, including SDK compatibility, route drawing performance, pricing, API-key restrictions, offline behavior, and licensing.
- Keep map rendering behind a route-map component so the provider can be changed without rewriting run tracking or storage.
- Route history and run summaries must still work if map tiles cannot load or the device is offline. The locally saved route remains available for a simple route view if the selected map supports it.

### Battery and user communication

- On the first attempt to start a run, show a prominent, plain-language disclosure before requesting background-location access if that permission is requested. It must explain that location is used during an active run while the app is in the background and why.
- Separately mention that GPS tracking can use more battery. A suggested message: “WalkTrip uses your location to record your route and distance while a run is active, including when the app is in the background. GPS tracking can use more battery. Stop the run to end tracking.”
- Before a run, warn when the battery is low if battery state is available. Let the user continue or cancel; do not block a run based only on battery level.
- The disclosure dialog is not a substitute for Android's persistent foreground-service notification or system permission prompts.
- Avoid repeated nuisance popups after the user has understood the disclosure; retain an accessible explanation in settings/help.

## Proposed architecture

```text
Expo Router screens
        |
Run session controller / state machine
        |
Android location adapter ---- foreground tracking notification
        |
GPS validation and metric calculation
        |
SQLite repository (run state, points, summaries, sync status)
        |
Sync worker (authenticated, idempotent, retryable)
        |
Supabase Auth + PostgreSQL metadata + selected route storage
```

Suggested code organization (adjust to existing scaffold during Phase 0):

```text
src/
  app/                    Expo Router routes and layouts only
  features/
    run/                  screens, session controller, run state
    history/              history and run detail UI
    profile/              account and preferences
  core/
    location/             platform adapter, quality checks
    tracking/             metrics and session rules
    database/              SQLite schema and repositories
    sync/                  upload queue and retry policy
    auth/                  authentication boundary
    maps/                  provider-neutral route map component
  components/              shared UI
```

## Phased implementation plan

### Phase 0 — Product and technical foundation

**Work**

- Confirm MVP scope, Android support range, units, privacy defaults, and whether accounts/cloud sync are required at the first public launch.
- Confirm location permission and foreground-service design against Expo SDK 57 and current Android/Google Play requirements.
- Select mapping provider and verify licensing, budget, and Android SDK compatibility.
- Define run state transitions, sample fields, quality indicators, privacy/retention, and sync contract.
- Decide the local SQLite schema and route upload representation.
- Write acceptance criteria for GPS quality, recovery, offline use, and sync.

**Done when**

- Product scope and technical decisions above are recorded and reviewed.
- A test-device matrix and GPS trace/replay approach are agreed.
- Permission, notification, battery disclosure, and Play review requirements are documented.

### Phase 1 — App foundation

**Work**

- Establish Expo Router screen shell, design tokens, error/empty/loading patterns, and Android build workflow.
- Add a clear home screen with Start Run and recent activity entry points.
- Keep route files in `src/app/` and domain code outside it.

**Done when**

- The Android app builds and navigates through placeholder home, active run, history, and profile screens.
- No native project directories are edited manually.

### Phase 2 — Local persistence and run state

**Work**

- Add the SDK-compatible SQLite package and schema for runs, points, pause intervals, and sync state.
- Implement a run session state machine with start, pause, resume, finish, and discard transitions.
- Persist state transitions and points incrementally; restore an interrupted draft on next launch.

**Done when**

- A locally created run and its state survive normal app relaunch.
- Pause time is excluded from active duration and discarded runs are not shown as completed history.

### Phase 3 — Android GPS tracking

**Work**

- Add the SDK-compatible location package and required config plugin settings.
- Implement contextual permission education and location-services checks.
- Start user-initiated Android background tracking with a persistent notification.
- Store points locally and expose GPS quality, stale-signal, and interruption states.
- Implement and calibrate distance, elapsed time, pace, and outlier rules.
- Add pre-run battery messaging and first-run location disclosure.

**Done when**

- A run records while the screen is locked and the app is backgrounded on supported test devices.
- User can pause/resume/finish/discard, and tracking stops after finish/discard.
- Poor GPS produces an honest quality state and does not add obvious jumps to distance.
- Interrupted sessions recover previously committed data and communicate any known gap.

### Phase 4 — Summary, history, and route view

**Work**

- Build summary, history, and run detail screens from local data.
- Add route rendering behind a provider-neutral component.
- Handle empty history, unavailable tiles, incomplete routes, and low-quality GPS.

**Done when**

- A user can review completed runs and route data without internet access.
- Summary values match the locally stored run and clearly label estimates/limitations.

### Phase 5 — Accounts and cloud synchronization

**Work**

- Configure Supabase Auth and private run ownership policies if retained in MVP scope.
- Create minimal run metadata schema and secure route storage based on Phase 0 decision.
- Implement idempotent upload, retries, auth expiration handling, partial upload recovery, and conflict rules.
- Add account deletion and run deletion behavior, including local and remote data.

**Done when**

- Offline activities upload after connectivity returns without duplication.
- A user cannot read or modify another user's activities.
- Failed or partial uploads remain visible/retryable and do not remove the local copy.

### Phase 6 — Reliability, privacy, and release readiness

**Work**

- Validate GPS traces, indoor/urban/clear-sky routes, screen lock, app backgrounding, permission denial, location disabled, low battery, network loss, and app interruption.
- Test on real Android devices, including at least one device with aggressive background restrictions.
- Review privacy policy, data safety declarations, prominent location disclosure, permission declaration, store listing, and review demo requirements.
- Add limited product analytics for run lifecycle and failures; do not send precise route points to analytics.
- Measure battery use and tracking continuity during representative runs.

**Done when**

- Critical run journeys pass the agreed acceptance criteria on the target Android device matrix.
- Known limitations and manufacturer-specific setup guidance are documented in-product or support material.
- Store review materials accurately show the user-initiated tracking flow, disclosure, permissions, and notification.

### Phase 7 — Closed beta and Android launch

**Work**

- Release to a small Android beta group and collect opt-in diagnostics about tracking failures and GPS quality without collecting unnecessary route detail.
- Triage crashes, missing points, battery drain, permission confusion, and sync failures before widening rollout.
- Launch Android v1 when reliability and policy requirements are met.

**Done when**

- Beta exit criteria are met, critical data-loss bugs are resolved, and the support/recovery process is ready.

## Acceptance and reliability principles

- Starting and saving a run never depends on an account, internet connection, or map tile service.
- The app does not show stale GPS data as current pace without a quality indication.
- A GPS jump cannot silently create a large distance increase.
- Paused intervals do not add to active duration or distance.
- A run is saved locally before any cloud request is attempted.
- A server retry cannot create duplicate runs.
- Location collection ends when the user finishes or discards the active run.
- Permission denial, GPS disabled, poor signal, low battery, storage failure, and sync failure have visible user-facing handling.
- The app never promises that Android will keep tracking after the user force-stops the app or the system terminates the service.

## Key risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Android device makers stop background work | Persistent foreground service, device testing, stale-update detection, clear guidance, and honest limitations |
| GPS noise distorts distance | Preserve samples, validate outliers, expose quality state, and tune against field traces |
| Battery use surprises users | Pre-run disclosure, optional low-battery warning, visible ongoing notification, and battery testing |
| Background location permission or service fails Play review | Request minimum scope, make disclosure prominent, document core use, and prepare an Android demonstration video |
| App or OS interruption loses a run | Commit points promptly, persist session state, recover local draft, and state that interruptions can create gaps |
| Cloud upload leaks routes or duplicates data | Private-by-default policies, user-scoped authorization, stable IDs, idempotency, and deletion flows |
| Map costs or licensing change | Provider-neutral UI, validate current terms and prices, and preserve offline activity data independently of maps |
| Scope expands before tracking is reliable | Keep deferred features out of v1 acceptance criteria and prioritize field reliability |

## Future work after Android v1

Only after the Android tracker is reliable, consider iOS support, Health Connect, goals and records, advanced statistics, training plans, social features, challenges, wearable support, and coaching/AI. These features should use the stable run/session model and privacy boundaries established for v1.

## Reference documentation

- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
- [Expo SDK 57 Location](https://docs.expo.dev/versions/v57.0.0/sdk/location/)
- [Expo SDK 57 SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/)
- [Google Play: Understanding background location permissions](https://support.google.com/googleplay/android-developer/answer/9799150)
- [Android: Foreground service types](https://developer.android.com/develop/background-work/services/fgs/service-types)
