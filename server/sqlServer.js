import http from "node:http";
import crypto from "node:crypto";
import { sqlPool } from './database.js';
import { authenticate, requireRole, fail } from './auth.js';
import { body, cors, json, errorResponse } from './http.js';

const port = Number(process.env.SQL_SERVER_PORT || 8788);
const pool = sqlPool();

async function bootstrap(identity) {
  const [students] = await pool.query("SELECT nim, name, faculty, residence, email FROM students ORDER BY nim");
  const [periods] = await pool.query("SELECT id, label, serving_time AS time, active FROM meal_periods ORDER BY FIELD(id, 'morning', 'afternoon', 'evening')");
  const [queues] = await pool.query("SELECT id, nim, period_id AS periodId, student_name AS studentName, status, DATE_FORMAT(joined_at, '%Y-%m-%d') AS date, TIME_FORMAT(joined_at, '%H:%i') AS joinedAt, record_id AS recordId FROM queues WHERE status = 'waiting' ORDER BY joined_at");
  const [records] = await pool.query("SELECT id, nim, period_id AS periodId, period_label AS period, student_name AS studentName, staff_name AS staff, verification_token AS verificationToken, DATE_FORMAT(served_date, '%Y-%m-%d') AS date, TIME_FORMAT(served_time, '%H:%i') AS time FROM meal_records ORDER BY id");
  if (identity.role === 'Mahasiswa') {
    return { students: students.filter(x => x.nim === identity.nim), mealPeriods: periods, queues: queues.map(({ id, nim, status, periodId, joinedAt, date }) => ({ id, nim, status, periodId, joinedAt, date })), mealRecords: records.filter(x => x.nim === identity.nim) };
  }
  return { students, mealPeriods: periods, queues, mealRecords: records };
}

const server = http.createServer(async (request, response) => {

  try {
    cors(request, response);
    if (request.method === 'OPTIONS') { response.writeHead(204); return response.end(); }
    const identity = await authenticate(request);
    const uid = identity.uid;
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "GET" && url.pathname === "/api/sql/bootstrap") return json(response, 200, await bootstrap(identity));

    if (request.method === "POST" && url.pathname === "/api/sql/queues") {
      const data = await body(request);
      if (identity.role === 'Mahasiswa') {
        if (!identity.nim || data.nim !== identity.nim) throw fail(403, 'forbidden', 'NIM tidak sesuai profil.');
      } else requireRole(identity, ['Staff', 'Supervisor', 'Head', 'Admin']);
      const [result] = await pool.execute("INSERT INTO queues (nim, period_id, student_name) VALUES (?, ?, (SELECT name FROM students WHERE nim = ?))", [data.nim, data.periodId, data.nim]);
      return json(response, 201, { id: result.insertId, nim: data.nim, periodId: data.periodId, status: "waiting" });
    }

    if (request.method === "POST" && url.pathname === "/api/sql/meal-records") {
      const data = await body(request);
      requireRole(identity, ['Staff', 'Supervisor', 'Head', 'Admin']);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const token = crypto.randomUUID();
        const [result] = await connection.execute("INSERT INTO meal_records (nim, period_id, period_label, student_name, staff_uid, staff_name, verification_token, served_date, served_time) SELECT s.nim, ?, ?, s.name, ?, ?, ?, CURRENT_DATE, CURRENT_TIME FROM students s WHERE s.nim = ?", [data.periodId, data.period, uid, identity.name || uid, token, data.nim]);
        await connection.execute("UPDATE queues SET status = 'completed', completed_at = CURRENT_TIMESTAMP, record_id = ? WHERE nim = ? AND period_id = ? AND status = 'waiting'", [result.insertId, data.nim, data.periodId]);
        await connection.commit();
        return json(response, 201, { id: result.insertId, nim: data.nim, periodId: data.periodId, period: data.period, verificationToken: token });
      } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
    }

    if (request.method === "PATCH" && url.pathname.startsWith("/api/sql/meal-periods/")) {
      const data = await body(request);
      requireRole(identity, ['Staff', 'Supervisor', 'Head', 'Admin']);
      if (typeof data.active !== 'boolean') throw fail(400, 'invalid_period', 'active harus boolean.');
      await pool.execute("UPDATE meal_periods SET active = ? WHERE id = ?", [Boolean(data.active), url.pathname.split("/").pop()]);
      return json(response, 200, { ok: true });
    }
    return json(response, 404, { message: "Endpoint tidak ditemukan." });
  } catch (error) { return errorResponse(response, error); }
});

server.listen(port, "127.0.0.1", () => console.log(`SANTAP MySQL API berjalan di http://127.0.0.1:${port}`));


