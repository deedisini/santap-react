# QR identity and duplicate meal prevention

## Answers for the lecturer

**How does SANTAP know a student has taken their share?**

Scanning identifies a student; it does not itself record attendance or consume a meal allowance. An authorized staff member records the handover (including through queue completion). The server checks for an existing meal record using **NIM + service date (WITA) + meal period**. Only one collection is allowed for that combination. Another period or another date has its own allowance; reopening a period on the same day does not reset it.

- [Firestore operations](../server/operations.js) check existing records inside a transaction and create a deterministic date/period/NIM document. Concurrent writes cannot create two records at that document. Legacy records are also checked.
- [MySQL operations](../server/sqlOperations.js) use a transaction and row locks. The [schema](../server/schema.sql) additionally enforces `UNIQUE (nim, served_date, period_id)`.
- [Firestore rules](../firestore.rules) prohibit direct client writes to meal records. Client-side button disabling is a convenience, not the enforcement boundary.
- Pending offline scans are only temporary identifications; they require server validation before becoming confirmed collections. Local demo mode is not a shared production enforcement system.

**Are the QR codes static, and why allow downloads?**

The student identity QR contains `{ type: "santap.student", version: 1, nim }`. It remains identical while the NIM is unchanged. The student page offers a PNG download for reuse without loading that page. It is an identity lookup, not a secret token, meal authorization, or collection receipt. Downloading does not reserve a meal or increase the allowance. Staff still need server validation to record collection.

The separate staff receipt QR identifies an already-recorded transaction and includes its verification token; it is not the student's identity QR.

**Can students share their QR codes?**

Yes. A static QR can be copied, and the manual NIM fallback also identifies an account without proving the holder's identity. The duplicate limit prevents two collections under one NIM in the same session, but cannot prevent an impostor from using someone else's unused allowance first.

Staff should compare the returned name/NIM with a physical student card and its holder before recording a meal or completing a queue entry. Both workflows now display that instruction. This is a human identity check, not automated anti-sharing enforcement. The application currently has no trusted student photograph or automated proof of physical presence.

Rotating, short-lived QR tokens could reduce reuse of old screenshots, but would not eliminate live sharing and would need consistent enforcement across manual and offline workflows. They are not implemented by this change.
