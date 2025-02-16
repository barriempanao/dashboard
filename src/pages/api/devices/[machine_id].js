// pages/api/devices/[machine_id].js
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { removeDeviceById } from '../../../lib/db';

const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';
const client = jwksClient({ jwksUri: COGNITO_JWKS_URL });

function getKey(header, callback) {
  if (!header || !header.kid) {
    return callback(new Error("Falta el 'kid' en el header del token"));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Obtener las cookies
  const cookies =
    req.cookies && Object.keys(req.cookies).length > 0
      ? req.cookies
      : req.headers.cookie
        ? cookie.parse(req.headers.cookie)
        : {};

  const token = cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  // Verificar el token
  let decoded;
  try {
    decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) return reject(err);
        resolve(decodedToken);
      });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado', details: err.message });
  }

  const { machine_id } = req.query;
  if (!machine_id) {
    return res.status(400).json({ error: 'Missing machine_id parameter' });
  }

  try {
    const result = await removeDeviceById(machine_id);
    return res.status(200).json({ message: 'Device removed successfully', result });
  } catch (error) {
    console.error("Error removing device:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
