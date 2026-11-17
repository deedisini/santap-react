# SANTAP Database Assignment: MySQL/MariaDB setup

This guide belongs to the separate Database class assignment. The main SANTAP application no longer starts or depends on this SQL service; it uses Firebase Authentication and Cloud Firestore.

For an existing database upgrading to v1.2, review and apply [the one-time migration](migrate-v1.2.sql) before starting the SQL server. New installations use [schema.sql](schema.sql) and do not also run the migration.

## Using XAMPP through PowerShell

1. Start MariaDB from PowerShell. Apache is not required for this Node API:

```powershell
& 'C:\xampp\mysql_start.bat'
```

2. Confirm that MariaDB is accepting connections:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "SELECT VERSION();"
```

3. Import the schema from the repository root:

```powershell
Get-Content .\database-assignment\schema.sql -Raw | & 'C:\xampp\mysql\bin\mysql.exe' -u root
```

If your MySQL root account has a password, add `-p` after `-u root`.

4. Verify the database and tables:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "SHOW DATABASES;"
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "USE santap; SHOW TABLES;"
```

5. Optional presentation data and reset scripts are [demo-seed.sql](demo-seed.sql) and [demo-reset.sql](demo-reset.sql). Use them only with a database that may be changed.

6. The SQL API and browser adapter are preserved here as assignment material: [sqlServer.js](sqlServer.js), [sqlOperations.js](sqlOperations.js), [database.js](database.js), and [sqlApi.js](sqlApi.js). They are not included in the main app's `npm` scripts or dependency graph.
