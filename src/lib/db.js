// lib/db.js
import mysql from 'mysql2/promise';

let pool;

export async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function getUserByEmail(email) {
  const pool = await getPool();
  console.log('DB_HOST:', process.env.DB_HOST); // Muestra el valor de DB_HOST
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  console.log("Usuario encontrado:", rows[0]); // Muestra el usuario encontrado
  return rows.length > 0 ? rows[0] : null;
}

export async function getLicensesByUserId(user_id) {
  const pool = await getPool();
  // Consulta para obtener todas las licencias asociadas al usuario
  const [rows] = await pool.query('SELECT * FROM licenses WHERE user_id = ?', [user_id]);
  console.log("Licencias encontradas para el user_id", user_id, ":", rows);
  return rows;
}
