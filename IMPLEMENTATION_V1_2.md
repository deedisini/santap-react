# SANTAP v1.2 implementation and verification

The prototype now derives meal service from one configurable Asia/Makassar schedule and validates retrievals on the trusted server for either operational database. The original SRS v1.1 is preserved. [The proposed v1.2 addendum](./SANTAP_SRS_V1_2_PROPOSED.md) records requirement amendments, acceptance criteria, traceability and unresolved decisions.

## Ringkasan Bahasa Indonesia

Jam resmi, jam WITA, peringatan 10 menit, validasi server, pencegahan duplikasi, pembatalan antrean, pembaruan profil, monitoring harian, dan penyimpanan identifikasi sementara sudah ditambahkan. Integrasi push disiapkan menggunakan Firebase yang sudah terpasang. Pengiriman nyata memerlukan konfigurasi dan worker aktif. Sesuai instruksi pemilik proyek, tema Sabat aktif secara default setiap Jumat 18.00 sampai Sabtu 18.00 WITA.

Database yang sudah ada belum dimigrasikan, rules belum dipublikasikan, dan tidak ada email/push nyata yang dikirim dalam pemeriksaan ini. Browser pengujian tidak tersedia. Hasil otomatis tidak menggantikan uji perangkat, kamera, aksesibilitas visual atau beban kampus.

## Files changed

| Area | Files and purpose |
|---|---|
| Shared schedule | [shared/operations.js](./shared/operations.js): defaults, configurable schedule validation, WITA date/window functions, independent Sabbath windows. |
| Firestore backend | [server/operations.js](./server/operations.js), [firestore.rules](./firestore.rules): server-only writes, transactions, complete-profile checks, deterministic meal IDs, legacy duplicate checks, private student data and anonymous public queue projection. |
| SQL backend | [server/sqlOperations.js](./server/sqlOperations.js), [server/sqlServer.js](./server/sqlServer.js), [server/database.js](./server/database.js): trusted validation, transactions/locking, cancellation, WITA connection timezone, anonymous student queue view. |
| Schema | [server/schema.sql](./server/schema.sql), [server/migrate-v1.2.sql](./server/migrate-v1.2.sql), [server/demo-seed.sql](./server/demo-seed.sql): same-day pause and unique retrieval tuple; legacy display metadata updated and SQL setup timezone explicit. |
| Service API | [server/emailServer.js](./server/emailServer.js), [server/profiles.js](./server/profiles.js): operational routes, Admin configuration and student updates, optional worker startup. The server's historical filename is retained; operational validation does not require SMTP. |
| Push | [server/push.js](./server/push.js), [public/notifications-sw.js](./public/notifications-sw.js), [src/components/PushControls.jsx](./src/components/PushControls.jsx), [src/lib/pushRegistration.js](./src/lib/pushRegistration.js), [.env.example](./.env.example): token registration, authorized scheduled delivery, local/remote deduplication, expiry and opt-in permission. |
| App integration | [src/App.jsx](./src/App.jsx), [src/lib/santap.js](./src/lib/santap.js), [src/lib/sqlApi.js](./src/lib/sqlApi.js), [src/lib/serviceApi.js](./src/lib/serviceApi.js): derived active period, shared config subscription, server writes, ten-second SQL refresh, error status metadata and sorted Firestore queues. |
| Operational UI | [OperationsClock](./src/components/OperationsClock.jsx), [OperationsSettings](./src/components/OperationsSettings.jsx), [ProfileEditor](./src/components/ProfileEditor.jsx), [StaffPage](./src/pages/StaffPage.jsx), [StudentPage](./src/pages/StudentPage.jsx), [SupervisorPage](./src/pages/SupervisorPage.jsx), [QrScanner](./src/components/QrScanner.jsx): clock/warnings, schedule/sunset editing, profile editing, queue cancellation and current-day totals. Scanner callbacks use a ref so the one-second parent clock does not restart the camera; late camera acquisition after unmount is stopped. |
| Pending storage | [PendingScans](./src/components/PendingScans.jsx), [pendingScans.js](./src/lib/pendingScans.js): UID-isolated durable local entries, explicit unconfirmed status, reconnect/manual retry and unresolved late-entry handling. |
| Presentation and time | [src/styles.css](./src/styles.css), [src/utils/format.js](./src/utils/format.js), [src/utils/closingNotifications.js](./src/utils/closingNotifications.js), [src/data/demoData.js](./src/data/demoData.js): restrained warning, reduced motion, scoped Sabbath accents and WITA timestamps. The obsolete reminder utility was removed. |
| Documentation | Proposed SRS, this implementation report, four [v1.2 model sources](./docs/models/), and small amendments to [initiation](./DOKUMEN_INISIASI_SANTAP.md), [elicitation](./ELISITASI_SRS_SANTAP.md), [account setup](./ACCOUNT_SETUP.md) and [MySQL setup](./MYSQL_SETUP.md). Interview-question references are corrected. Historical Word SRS and requirement workbook remain snapshots. |
| Tests | [operations](./server/operations.test.js), [Firestore workflows](./server/firestoreOperations.test.js), [notifications](./server/notifications.test.js), [render smoke tests](./server/render.test.js); existing [workflow tests](./server/workflows.test.js) retained. |

## Deployment steps

1. Back up the SQL database. For an existing installation, review duplicate retrievals using the first SELECT in the migration. Resolve duplicates explicitly; no automatic deletion is included. Apply the migration once. It intentionally fails if uniqueness cannot be established. A new installation uses the updated schema directly. Do not run the migration again after creating a new schema, because it already contains the new column/constraint.
2. Publish the updated Firestore rules alongside the backend. Direct browser operational writes are now denied, so the service API must be running even in Firestore mode. Keep normal Firebase Admin credentials server-only. Authentication, profiles and settings remain in Firestore in either database mode.
3. Start `npm run email-server`, the SQL server when SQL mode is enabled, and `npm run dev`. Production must proxy `/api/operations`, `/api/admin`, `/api/push`, `/api/feedback` and `/api/email-report`; SQL retains its configured API URL. No SMTP is needed for operational validation or closing reminders.
4. Sign in as Admin to edit schedules. Defaults are official hours; Friday and Saturday dinner use the separate exception fields. Save-time validation rejects overlapping or malformed intervals. The same-day manual period control pauses/resumes within scheduled hours only. No out-of-hours override was invented.
5. For push, supply the Firebase Console public web-push key as `VITE_FIREBASE_VAPID_KEY`, enable the FCM registration API if necessary, and set server-only `ENABLE_PUSH_WORKER=true`. Restart the backend and rebuild/restart the frontend after environment changes. The existing `firebase` and `firebase-admin` dependencies suffice; no new package was installed. Workers claim events in Firestore, so multiple workers do not deliberately send the same event twice to one subscription.
6. Supervisor/Head selects the device enable button to request permission. Without VAPID, an open page can still use local browser notifications; without browser permission/support, it retains in-app warnings. Background push requires a running worker and supported secure browser context. A successful token registration is not proof that the worker is running. Closing reminders never send email. Existing report, invitation and feedback emails are preserved.
7. Sabbath appearance defaults to Friday 18:00 inclusive through Saturday 18:00 exclusive, every week in Asia/Makassar. Admin can disable it or edit the weekly times. Nonempty sourced dated windows replace the weekly schedule; outside those windows the regular theme applies. Previously saved disabled/custom settings are preserved: enable the checkbox and remove custom windows to use the weekly default on such installations. No sunset data or external service is needed for the default. This follows the owner's explicit decision and does not affect meal schedules.

New Firestore queue entries get sanitized position projections. Historical entries without a projection remain serviceable/cancellable but show position unavailable. Rejoin a current queue through the new API, or perform a reviewed data migration if historical projection backfill is required. Existing queue entries are not silently rewritten.

## Verification

Latest Sabbath-default follow-up: the full `npm test` suite passed 21 tests and the production build passed (existing large-bundle warning). `git diff --check` found no whitespace errors. Editor diagnostics did not return during this follow-up; the previous implementation check reported no diagnostics. Browser visual verification remains outstanding.

The automated suite includes schedule boundaries on every weekday, all warning thresholds, timezone/date rollover, pause behavior, configurable/overlap validation, Sabbath boundaries, per-UID pending storage, old pending-date rejection, SQL workflow rejection and trusted values, Firestore atomic workflow behavior with transaction test doubles, push role checks/event claims, service-worker local/remote deduplication and expiry, and server rendering of dashboard components with Firestore timestamp shapes.

Database and Firebase tests use test doubles, not live service credentials or an emulator. The serialized transaction double exercises duplicate-handling logic but is not a substitute for a real multi-client concurrency test against Firestore/MySQL.

The production build succeeds with a large-bundle warning. Firebase Messaging loads as a separate chunk. The existing icon dependency's ESM files are absent locally, so its production CommonJS alias is preserved; render tests use a separate SSR configuration rather than changing installed dependencies.

Both browser-opening tools failed: the integrated open-page tool returned an error, and the computer-use browser host reported unavailable. No visual screenshot or interactive click-through PASS is claimed. Component rendering and code inspection cover these paths:

| Control | Evidence available | Remaining acceptance |
|---|---|---|
| Student QR, barcode/QR camera, manual NIM | Existing scanner preserved; student/staff components render; common validation tested. | Real camera, barcode card format, permission denial and retry. |
| Join/complete/cancel queue | Rendering and server validation tests; handlers inspect errors. | Multi-device live workflow and ordering under load. |
| Period pause/resume | Server enforcement tests and code inspection. | Live propagation between clients and exact device display. |
| Clock and closing warning | Boundary tests, render tests and reduced-motion CSS inspection. | Mobile layout and visual pulse/reduced-motion verification. |
| Push enable/disable | Permission is only requested in button handler; mocked worker/role/deduplication tests pass. | Browser permission UX, real FCM delivery, worker uptime, logout while offline. |
| Admin settings/profile forms | Render/code inspection; input validation. | Live persistence, failure recovery and keyboard navigation. |
| Sabbath appearance | Weekly Friday/Saturday boundaries, recurrence, UTC conversion, disable/custom settings and sourced-window validation; scoped blue/gold CSS preserves light content surfaces. | All-dashboard visual/contrast verification. |
| Pending scan controls | Durable storage and server expiry validation tested; reconnect/manual handlers inspected. | Real network interruption, storage denial and reconciliation SOP. |

## Limits and decisions still needed

- This remains a prototype, not a fully cached offline web application. Pending storage requires an already-loaded app and roster. Entries remain until successful synchronization or deliberate local removal; authenticated UID isolation is an application boundary, not local encryption.
- Closed-period pending entries are retained for review. No backdating, automatic exception approval or policy for physical food handover offline has been introduced.
- Push is best effort. The worker checks every 15 seconds and can catch up within the remaining warning window; background delivery is not guaranteed. Failed/uncertain sends are marked and not automatically retried. Delivery records require an operational retention policy before long-term production use.
- Logout attempts to unregister the device before signing out. A network failure can leave a server subscription until invalidation/cleanup; test this on real devices and agree the required offline-logout behavior before production.
- Cross-store profile updates use rollback/compensation, not a distributed transaction. A server crash between SQL and Firestore commits can still require reconciliation. This architectural limit is recorded instead of claiming atomicity across services.
- Firebase settings/profile subscriptions are still required in SQL mode. The server clock must be synchronized; a wrong client clock can misstate the display but cannot authorize an out-of-hours write.
- Campus response time, availability, accessibility and full mobile/theme behavior remain acceptance work. The original workbook is a pre-v1.2 snapshot; the new addendum is the proposed change matrix.

## Visual direction and antislop evidence

The existing layout/typography is retained. Blue sidebar and primary-action accents identify the Sabbath period; muted gold is limited to the greeting. Content surfaces stay light for readability. The border pulse exists only to draw attention to imminent closing and has no layout/opacity flashing. The user supplied this direction; no image/logo/person asset was generated.

Antislop was applied during implementation. Code/render checks are recorded above, but its full visual and click-through delivery gate remains unverified because the browser host is unavailable. No final visual PASS is claimed.
