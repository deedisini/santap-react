import mysql from 'mysql2/promise';
let pool;
export function sqlPool() {
  if (!pool) {
    pool = mysql.createPool({ host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER || 'root', password: process.env.MYSQL_PASSWORD || '', database: process.env.MYSQL_DATABASE || 'santap', connectionLimit: 10, dateStrings: true, timezone: '+08:00' });
    pool.pool.on('connection', connection => connection.query("SET time_zone = '+08:00'"));
  }
  return pool;
}
