// pages/api/user/update.js

import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getPool } from '../../../lib/db';

// URL del JWKS de tu User Pool de Cognito
const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

// Crea el cliente JWKS
const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

// Función para obtener la clave pública
function getKey(header, callback) {
  if (!header || !header.kid) {
    return callback(new Error("Missing kid in token header"));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extrae las cookies (usando req.cookies o parseando req.headers.cookie)
  const cookies = req.cookies && Object.keys(req.cookies).length > 0
    ? req.cookies
    : req.headers.cookie
      ? cookie.parse(req.headers.cookie)
      : {};
  
  const token = cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // Verifica y decodifica el token
  let decoded;
  try {
    decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) {
          reject(err);
        } else {
          resolve(decodedToken);
        }
      });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }

  const email = decoded.email;
  if (!email) {
    return res.status(400).json({ error: 'Token does not contain email' });
  }

  // Extrae los datos actualizados del cuerpo de la petición
  const {
    first_name,
    last_name,
    phone,
    address,
    tax_identifier,
    country,
    date_of_birth,
    role,
  } = req.body;

  // Aquí podrías agregar validaciones adicionales de cada campo

  try {
    const pool = await getPool();
    const [result] = await pool.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, phone = ?, address = ?, tax_identifier = ?, country = ?, date_of_birth = ?, role = ? 
       WHERE email = ?`,
      [first_name, last_name, phone, address, tax_identifier, country, date_of_birth, role, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
