// pages/api/devices.js
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getDevicesByLicenseId } from '../../lib/db';

// URL del JWKS de tu User Pool de Cognito
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
  const { license_id } = req.query;
  if (!license_id) {
    return res.status(400).json({ error: 'Missing license_id parameter' });
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

  try {
    const devices = await getDevicesByLicenseId(license_id);
    return res.status(200).json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
