import http from "node:http";
import { sqlPool } from './database.js';
import { authenticate, requireRole, fail } from './auth.js';
import { body, cors, json, errorResponse } from './http.js';
import { firebase } from './auth.js';
import { readOperations } from './operations.js';
import { sqlOperation } from './sqlOperations.js';

const port = Number(process.env.SQL_SERVER_PORT || 8788);
const pool = sqlPool();

async function bootstrap(identity) {
  const [students] = await pool.query("SELECT nim, name, faculty, residence, email FROM students ORDER BY nim");
  const [periods] = await pool.query("SELECT id, label, serving_time AS time, active, paused_date AS pausedDate FROM meal_periods ORDER BY FIELD(id, 'morning', 'afternoon', 'evening')");
  const [queues] = await pool.query("SELECT id, nim, period_id AS periodId, student_name AS studentName, status, DATE_FORMAT(joined_at, '%Y-%m-%d') AS date, TIME_FORMAT(joined_at, '%H:%i') AS joinedAt, record_id AS recordId FROM queues WHERE status = 'waiting' ORDER BY joined_at");
  const [records] = await pool.query("SELECT id, nim, period_id AS periodId, period_label AS period, student_name AS studentName, staff_name AS staff, verification_token AS verificationToken, DATE_FORMAT(served_date, '%Y-%m-%d') AS date, TIME_FORMAT(served_time, '%H:%i') AS time FROM meal_records ORDER BY id");
  if (identity.role === 'Mahasiswa') {
    return { students: students.filter(x => x.nim === identity.nim), mealPeriods: periods, queues: queues.map(({ id, status, periodId, joinedAt, date }) => ({ id, status, periodId, joinedAt, date, ...(queues.find(q => q.id === id)?.nim === identity.nim ? { nim: identity.nim } : {}) })), mealRecords: records.filter(x => x.nim === identity.nim) };
  }
  return { students, mealPeriods: periods, queues, mealRecords: records };
}

const server = http.createServer(async (request, response) => {

  try {
    cors(request, response);
    if (request.method === 'OPTIONS') { response.writeHead(204); return response.end(); }
    const identity = await authenticate(request);
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "GET" && url.pathname === "/api/sql/bootstrap") return json(response, 200, await bootstrap(identity));

    if (request.method === "POST" && url.pathname === "/api/sql/queues") {
      const data = await body(request);
      return json(response, 201, await sqlOperation(pool, identity, 'queue', data, await readOperations(firebase().db)));
    }

    if (request.method === "POST" && url.pathname === "/api/sql/meal-records") {
      const data = await body(request);
      return json(response, 201, await sqlOperation(pool, identity, 'meal', data, await readOperations(firebase().db)));
    }

    if (request.method === "PATCH" && url.pathname.startsWith("/api/sql/meal-periods/")) {
      const data = await body(request);
      return json(response, 200, await sqlOperation(pool, identity, 'period', { ...data, periodId: url.pathname.split('/').pop() }, await readOperations(firebase().db)));
    }
    if (request.method === 'POST' && url.pathname === '/api/sql/cancel') return json(response, 200, await sqlOperation(pool, identity, 'cancel', await body(request), await readOperations(firebase().db)));
    return json(response, 404, { message: "Endpoint tidak ditemukan." });
  } catch (error) { return errorResponse(response, error); }
});

server.listen(port, "127.0.0.1", () => console.log(`SANTAP MySQL API berjalan di http://127.0.0.1:${port}`));


