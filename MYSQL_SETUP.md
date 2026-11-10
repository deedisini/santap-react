# SANTAP Firebase + MySQL setup

Firebase is used for Authentication and the `users/{uid}` profile. MySQL is used for operational data: students, meal periods, queues, and meal records.

## Using XAMPP through PowerShell

1. Start MariaDB from PowerShell. Apache is not required for this Node API:

```powershell
& 'C:\xampp\mysql_start.bat'
```

If the log says `ibdata1 must be writable`, open PowerShell as Administrator before running the command. MariaDB must be able to write inside `C:\xampp\mysql\data`:

```powershell
icacls 'C:\xampp\mysql\data' /grant "${env:USERNAME}:(OI)(CI)M" /T
& 'C:\xampp\mysql_start.bat'
```

Do not delete `ibdata1`; it contains the shared InnoDB data file.

If PowerShell does not invoke the batch file directly, use:

```powershell
cmd /c C:\xampp\mysql_start.bat
```

2. Confirm that MariaDB is accepting connections:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "SELECT VERSION();"
```

3. Open PowerShell in the project folder and import the schema through XAMPP's MySQL command-line client:

```powershell
Get-Content .\server\schema.sql -Raw | & 'C:\xampp\mysql\bin\mysql.exe' -u root
```

If your MySQL root account has a password, add `-p` after `-u root` and enter it when prompted.

4. Verify the database and tables:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "SHOW DATABASES;"
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "USE santap; SHOW TABLES;"
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "USE santap; SELECT * FROM students;"
```

For the classroom requirement of at least 20 demonstration records per table, load the optional presentation dataset after the schema:

```powershell
Get-Content .\server\demo-seed.sql -Raw | & 'C:\xampp\mysql\bin\mysql.exe' -u root
```

Then verify the row counts:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "USE santap; SELECT 'users' AS table_name, COUNT(*) AS records FROM users UNION ALL SELECT 'students', COUNT(*) FROM students UNION ALL SELECT 'meal_periods', COUNT(*) FROM meal_periods UNION ALL SELECT 'queues', COUNT(*) FROM queues UNION ALL SELECT 'meal_records', COUNT(*) FROM meal_records;"
```

6. Leave the default XAMPP credentials in `.env.local` unless you changed them:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=santap
MYSQL_USER=root
MYSQL_PASSWORD=
```

If you assigned a MySQL password in XAMPP, put that password in `MYSQL_PASSWORD`.

7. Copy the MySQL and Firebase values from `.env.example` into `.env.local`.
8. Start the SQL API with `npm run sql-server`.
9. Start Vite in another terminal with `npm run dev`.

To demonstrate a newly saved meal record during your presentation:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "USE santap; SELECT id, nim, period_label, served_date, served_time FROM meal_records ORDER BY id DESC LIMIT 10;"
```

The SQL API listens on `http://127.0.0.1:8788` by default. The browser sends a Firebase ID token; the server verifies it and checks the user's Firestore role. Configure Firebase Admin credentials before starting either backend. See [ACCOUNT_SETUP.md](./ACCOUNT_SETUP.md) for Admin provisioning, invitation email, student ratings, and the required server settings.

Firestore remains available as a fallback when `VITE_SQL_API_URL` is empty. Demo mode remains available when Firebase variables are not configured.
