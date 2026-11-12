# Proposed SANTAP SRS Version 1.2 Revision

Status: proposed academic baseline, 12 November 2026. This is an addendum to [SRS v1.1](./SANTAP_SRS_V1_1%20(1).docx), not a replacement. Unchanged functional requirements, business rules, user stories and use cases retain their v1.1 identifiers. Formal stakeholder sign-off and production acceptance remain outstanding.

## Ringkasan Bahasa Indonesia

Revisi ini menetapkan jam resmi Asia/Makassar, validasi periode pada server, jam operasional langsung, serta reminder push sepuluh menit sebelum penutupan. Tema Sabat adalah peningkatan visual opsional, terpisah dari hak makan dan jadwal layanan. Sesuai keputusan pemilik proyek, default tema aktif setiap Jumat pukul 18.00 sampai Sabtu pukul 18.00 WITA, tanpa memerlukan data matahari terbenam. Admin dapat menonaktifkan tema, mengubah jam, atau menggunakan rentang bertanggal bersumber.

Perbaikan juga mencakup pencegahan duplikasi, privasi mahasiswa, pembatalan antrean, pembaruan profil oleh Admin, monitoring harian, serta identifikasi sementara saat jaringan bermasalah. Identifikasi sementara bukan catatan pengambilan final. Setelah periode berakhir, sinkronisasi tidak boleh melewati validasi jadwal; prosedur pengecualian masih memerlukan keputusan pengelola.

## English summary

This revision specifies official WITA serving hours, server-side enforcement, a local operational clock, and push reminders ten minutes before closing. The optional Sabbath theme defaults to Friday 18:00 through Saturday 18:00 WITA every week, as explicitly requested by the project owner, and never changes serving eligibility. Integrity corrections cover duplicates, privacy, queues, profile maintenance, daily totals and pending identifications. Late synchronization cannot override closing; an exception procedure remains a stakeholder decision.

## Revision history and identifier preservation

| Baseline | Changes |
|---|---|
| KINTARA v1.0 | Historical elicitation source, including menu information. Preserve as evidence. |
| SANTAP v1.1 | Removed menus, added Head, preserved FR-01/02 and FR-06 through FR-27. Detailed Head access remained open. |
| Current elicitation supplement | Five roles, Admin, combined Staff/Supervisor access for Head, ratings and offline requirements. Its FR-01 through FR-18 form a separate namespace. |
| Proposed v1.2 | Official schedule supplied by the project owner, push clarification, clock/warnings, optional Sabbath configuration and integrity corrections. Follow-up decision: default weekly Friday 18:00–Saturday 18:00 WITA replaces the earlier sunset-data prerequisite. |

References below use **v1.1 IDs** unless prefixed `ELIS`. No historical requirement is renumbered. The [elicitation document](./ELISITASI_SRS_SANTAP.md) and [initiation document](./DOKUMEN_INISIASI_SANTAP.md) remain supporting artifacts. Existing approval placeholders do not establish formal approval.

## Business rule amendments

The project owner supplied the official hours below. These supersede old prototype times; the team must still attach organizational approval evidence.

| Period | Days | Opening | Closing | Warning begins |
|---|---|---|---|---|
| Breakfast | Every day | 05:30 | 08:00 | 07:50 |
| Lunch | Every day | 11:30 | 13:00 | 12:50 |
| Dinner | Sunday through Thursday | 17:00 | 18:30 | 18:20 |
| Dinner | Friday and Saturday | 16:30 | 18:00 | 17:50 |

| Rule | Amendment |
|---|---|
| BR-01 extended | Three periods use the official schedule in Asia/Makassar (WITA, UTC+8). Warning time is derived as closing minus ten minutes. |
| BR-04/06 clarified | Opening is inclusive; closing is exclusive. At the exact closing instant the server rejects new retrievals. A saved same-day pause also disables service. |
| BR-05 clarified | At most one retrieval per NIM, period ID and WITA date, across devices and direct API requests. |
| BR-09 new, proposed allocation | Only Admin can configure approved schedules. This responsibility needs stakeholder ratification. |
| BR-10 new | Closing push targets Supervisor and Head. Permission is requested through explicit user action. In-app reminders remain available without push. |
| BR-11 new, optional | Sabbath appearance is enabled by default from Friday 18:00 inclusive to Saturday 18:00 exclusive, Asia/Makassar, recurring weekly. Admin may disable it or configure times. Nonempty sourced dated windows replace the weekly schedule. Existing saved disable/custom settings are preserved. Theme state cannot alter serving hours or eligibility. |

The existing manual period control is retained as **same-day pause/resume within scheduled hours**. No documented out-of-hours override was found in v1.1 or the initiation document, so none was introduced. Automatic activation follows the daily schedule; legacy `active` booleans no longer determine operating hours. Ratify this interpretation alongside BR-09. No new rule excludes either residence category from service.

## Functional requirements and acceptance criteria

| ID | Amendment and acceptance criteria |
|---|---|
| FR-01/02 retained | Authenticate real operations and enforce role checks at the API. Head combines Staff and Supervisor functions (ELIS FR-17); account provisioning is Admin-only. AC: students cannot record meals, cancel queues, edit profiles, configure schedules or register supervisor push; Head cannot create accounts. |
| FR-06 through FR-09 retained | Preserve identity QR, QR/barcode camera identification and manual NIM. AC: valid methods converge on the same validation flow; scanning failure leaves manual input available. Real-camera acceptance remains required. |
| FR-10 through FR-16 extended | Server validates complete profile, scheduled period, same-day pause and duplicates; derives date, period label and staff identity from trusted data. AC: invalid/closed/paused/duplicate requests create no meal; simultaneous same-student requests produce at most one record; retrieval and matching same-day queue completion commit together. |
| FR-17 through FR-20 clarified | Current-period totals use today's WITA date; seven-day history remains separate. AC: yesterday's breakfast does not increase today's breakfast total; residence counts sum to current-period retrievals. SQL clients refresh visible data every ten seconds; Firestore subscribes to changes. SQL polling is not instantaneous realtime. |
| FR-21 extended | Resolve configurable closing times and day exceptions centrally. AC: Friday/Saturday dinner closes at 18:00 under defaults; other days at 18:30. |
| FR-22 extended | Browser push begins ten minutes before closing, with an in-app fallback. No closing email is introduced. AC: explicit enable action requests permission; denied/unavailable permission leaves warnings usable; a browser displays each closing event at most once across local/remote delivery; server rechecks recipient role. Background delivery depends on credentials, permission and a running worker. |
| FR-23 extended | Closed state follows server time even without an open supervisor page. AC: direct submissions at/after closing fail for ordinary and exceptional dinner days; warning stops at closing. |
| FR-24 through FR-27 clarified | Queue order follows join time; staff can complete or cancel service. AC: cancellation removes waiting status without creating a meal; students see their position without another student's identity. |
| FR-28 new | Admin configures period schedules. AC: valid non-overlapping same-day times affect both database paths, clock and reminders; invalid or overlapping intervals are rejected. |
| FR-29 new | Display WITA clock, current scheduled period, closing time and inactive/paused status. AC: clock updates locally each second; final-ten-minute border pulse has a two-second cycle; reduced motion makes it static; clock ticks perform no database reads. |
| FR-30 new, optional | Apply Sabbath appearance automatically using BR-11. AC: default Friday 17:59:59 is regular, Friday 18:00 activates, Saturday 17:59:59 remains active, Saturday 18:00 restores; repeat weekly regardless of device timezone. Disabled theme stays regular. Configured weekly times are validated. Nonempty dated windows take precedence and require sources; outside those windows appearance is regular. Functionality, focus and readability remain usable in both themes. |
| FR-31 new, retained supplement | Admin account provisioning and existing-student name/faculty/residence editing (ELIS FR-03/04). AC: unknown NIM, incomplete fields and unauthorized callers are rejected; profiles align with the selected operational store. NIM/email changes and role reassignment are outside the edit form. |
| FR-32 new, retained supplement | Student rating and optional suggestion (ELIS FR-18). AC: integer rating 1–5, suggestion up to 5,000 characters, server-controlled recipient/identity. Existing feedback, invitation and report emails remain; only closing reminders are specified as push. |
| FR-33 new, retained supplement | Pending identifications persist locally per authenticated UID (ELIS FR-15). AC: survive reload; another UID cannot see them through the app; sync is attempted on reconnect/remount and explicitly by staff; server revalidates; closed/prior-day entries remain unresolved; staff can remove entries locally. Pending identification is never represented as final or as authority to dispense food offline. |

## Nonfunctional amendments

| Existing ID | Interpretation or extension |
|---|---|
| NFR-01/02 | Clock does not query Firebase. ELIS NFR-01's three-second campus response target remains an unverified acceptance target requiring measurement. |
| NFR-03 through NFR-05 | Preserve concise identification. New controls use labelled inputs, visible focus and status feedback; animation respects reduced motion. |
| NFR-06/07 | Firestore uses server transactions, deterministic retrieval identities and legacy duplicate checks. SQL uses transactions, locks and a unique retrieval key. Existing duplicates require explicit review before migration. |
| NFR-08 | Failures remain visible; pending scans remain unconfirmed. |
| NFR-09 through NFR-11 | Verify Firebase ID tokens and roles server-side. Deny direct browser writes. Restrict student private data to its owner and authorized staff. Public queue projection contains no NIM/name. Push tokens/delivery claims are server-only. |
| NFR-12 | Push requires secure context, browser permission, Firebase credentials, VAPID setup and an active worker. Delivery cannot be guaranteed. The worker claims each event once; uncertain failed sends are not automatically retried. In-app fallback remains. |
| NFR-13 | One shared schedule module and centrally validated overrides support browser, both APIs and worker. Sabbath configuration is independent of meal scheduling. |

## User stories and traceability

US-01 and US-03 retain their identity/queue meaning. Extend US-02: as Supervisor, I want a closing push and current WITA time so I can supervise closing. Proposed US-04: as Admin, I want to configure approved hours and maintain profiles. Optional US-05: as a user, I want a respectful Sabbath greeting during the configured Sabbath period, defaulting to Friday 18:00–Saturday 18:00 WITA, without changing service functionality.

| Source | Requirements | v1.1 use case or new addition | Model |
|---|---|---|---|
| Official-hours request | BR-01/04/06, FR-10–16/21/23/28 | UC-04, UC-07; new UC-11 Configure Operations | Meal activity, use case, ERD extension |
| US-02 and push clarification | FR-21/22/29, BR-10 | UC-06, UC-07 | Closing activity, use case |
| US-01/03 | FR-06–16/24–27 | UC-02 through UC-05 | Meal activity, ERD extension |
| ELIS FR-03/04, proposed US-04 | FR-31 | new UC-09 Manage Accounts and Profiles | Use case, ERD extension |
| ELIS FR-17 | FR-02 | UC-08 Head Access, refined | Use case |
| ELIS FR-18 | FR-32 | new UC-10 Submit Rating and Suggestion | Use case |
| ELIS FR-15 | FR-33 | UC-04 alternate pending-identification flow | Meal activity |
| Optional Sabbath request | FR-30, BR-11 | UC-11 configuration; temporal theme behavior | Use case, settings entity |

## System models

Proposed models are separate so historical diagrams and their different UC numbering remain available:

- [Use case v1.2](./docs/models/SANTAP_V1_2_USE_CASE.puml) preserves v1.1 UC-01 through UC-08 and adds UC-09/10/11. QR, barcode and NIM remain alternate flows of UC-04.
- [Meal activity v1.2](./docs/models/SANTAP_V1_2_MEAL_ACTIVITY.puml) adds server-time validation, atomic recording and pending-identification alternatives.
- [Closing activity v1.2](./docs/models/SANTAP_V1_2_CLOSING_ACTIVITY.puml) adds the ten-minute trigger, role check, event deduplication and fallback.
- [ERD extension v1.2](./docs/models/SANTAP_V1_2_ERD.puml) adds settings, same-day pause, anonymous queue projection, push subscriptions and delivery claims. Settings/push are Firestore documents, not additional MySQL tables.

Reminder becomes a derived temporal event with delivery claims, refining the earlier conceptual Reminder entity. No menu, payment, stock, procurement or kitchen ERP module is added.

## Dependencies and outstanding decisions

1. Review/apply the SQL migration and publish Firestore rules before using the new backend. Existing databases have not been migrated by this code change.
2. Configure public VAPID key and Firebase Messaging; enable the worker. Keep Admin credentials server-only. Follow [Firebase web setup](https://firebase.google.com/docs/cloud-messaging/web/get-started) and [receiving messages](https://firebase.google.com/docs/cloud-messaging/web/receive-messages).
3. No sunset data is required for the owner-approved weekly 18:00 default. Sources are required only if Admin chooses custom dated sunset windows.
4. Ratify Admin configuration responsibility, pause/resume semantics, late-offline reconciliation SOP and any eligibility exceptions.
5. Complete live camera, push, database, responsive/theme, keyboard and campus-load acceptance. Browser automation was unavailable, so no click-through PASS is claimed.

See [implementation and verification notes](./IMPLEMENTATION_V1_2.md).
