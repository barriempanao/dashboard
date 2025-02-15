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
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  console.log("Usuario encontrado:", rows[0]);
  return rows.length > 0 ? rows[0] : null;
}

export async function updateUserByEmail(email, data) {
  const pool = await getPool();
  // Actualiza solo los campos que esperamos editar:
  const { first_name, last_name, phone, address, tax_identifier, country, date_of_birth } = data;
  await pool.query(
    `UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, tax_identifier = ?, country = ?, date_of_birth = ? WHERE email = ?`,
    [first_name, last_name, phone, address, tax_identifier, country, date_of_birth, email]
  );
  // Devuelve la info actualizada
  return getUserByEmail(email);
}
