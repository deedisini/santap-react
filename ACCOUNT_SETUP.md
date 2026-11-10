# Accounts, roles, and student feedback

## What changed

- **Admin** has a separate **Kelola Akun** screen. Creating an account provisions Firebase Authentication, its Firestore `users/{uid}` profile, and a student record when the role is Mahasiswa. The user receives a password-setup link by email; Admin never selects or sees the password.
- **Head** can switch between **Monitoring** (all existing supervisor features, including email reports) and **Antrean & Validasi** (all existing staff features).
- **Mahasiswa** can submit a 1–5 rating with an optional suggestion. Feedback is emailed to the configured Dining Hall recipient, includes the student's identity, and uses the authenticated Firebase email as `Reply-To`; it is not anonymous or stored as an in-app feedback history.
- Demo forms never create accounts or send email.

## One-time server setup

1. Install dependencies with `npm install`.
2. In Firebase Console, enable Email/Password authentication and create the Firestore database if not already configured.
3. Configure server credentials using Application Default Credentials. For a local service account JSON file, keep it **outside this repository** and set `GOOGLE_APPLICATION_CREDENTIALS` to its absolute path. Never put service-account credentials in a `VITE_` variable or a frontend file.
4. Add the following server-only settings to your existing `.env.local` without replacing your existing Firebase/MySQL settings:

   ```dotenv
   GOOGLE_APPLICATION_CREDENTIALS=C:/private/santap-service-account.json
   FIREBASE_PROJECT_ID=your-firebase-project-id
   SMTP_USER=your-sender@example.com
   SMTP_APP_PASSWORD=your-smtp-app-password
   FEEDBACK_TO=dining-hall-recipient@example.com
   ```

   The existing SMTP integration defaults to Gmail on port 465. Use your actual sender settings. The feedback recipient is configured on the server, not selected by students.

5. Publish [firestore.rules](./firestore.rules) in Firebase Console. Browser clients cannot assign roles; account provisioning uses the authenticated server API.
6. If `VITE_SQL_API_URL` is configured, import [server/schema.sql](./server/schema.sql) and start MySQL as described in [MYSQL_SETUP.md](./MYSQL_SETUP.md). New students are stored in MySQL; otherwise they are stored in Firestore. Profiles always remain in Firestore.

## Create the first Admin

An authenticated Admin must create subsequent users, so the first Admin is bootstrapped once from the trusted server environment.

For an existing Firebase Authentication account:

```powershell
npm run bootstrap-admin -- existing admin@example.com "Administrator Name"
```

Or create a new account and send its invitation:

```powershell
npm run bootstrap-admin -- create admin@example.com "Administrator Name"
```

If the account was created but its email invitation failed, fix SMTP and resend rather than creating another account:

```powershell
npm run bootstrap-admin -- invite admin@example.com
```

These commands change real Firebase data, and `create`/`invite` send real email. They have not been run as part of the implementation checks.

## Daily use

Run these in separate terminals:

```powershell
npm run email-server
npm run sql-server
npm run dev
```

The SQL server is needed only in MySQL mode. The email server now also handles account creation and student feedback. Vite forwards `/api` requests to that server on port 8787; the SQL client uses `VITE_SQL_API_URL` on port 8788.

Sign in as Admin, open **Kelola Akun**, fill in the user details and submit. Students additionally require NIM, faculty, and residence. For an existing roster entry, use the stored email: matching entries are linked without replacing their details; mismatched or already-claimed NIMs are rejected. If invitation delivery fails after account creation, use **Kirim ulang undangan**.

For production, configure your web server to proxy `/api/admin`, `/api/feedback`, and `/api/email-report` to the backend, use a reachable HTTPS SQL API URL instead of loopback, and configure `CORS_ORIGINS` for the frontend origin. Vite's development proxy is not part of the static build.

## References

- [Firebase Admin setup](https://firebase.google.com/docs/admin/setup)
- [Firebase user management](https://firebase.google.com/docs/auth/admin/manage-users)
- [Password setup/reset email links](https://firebase.google.com/docs/auth/admin/email-action-links)
