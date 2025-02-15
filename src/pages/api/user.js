// pages/api/user.js
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getUserByEmail, updateUserByEmail } from '../../lib/db';

// URL del JWKS de tu User Pool de Cognito
const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

function getKey(header, callback) {
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
  // Extraer token de las cookies
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const token = cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  // Verifica el token
  let decoded;
  try {
    decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) reject(err);
        else resolve(decodedToken);
      });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  const email = decoded.email;
  if (!email) {
    return res.status(400).json({ error: 'El token no contiene email' });
  }

  if (req.method === 'GET') {
    // Consulta la info del usuario
    const userData = await getUserByEmail(email);
    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.status(200).json(userData);
  } else if (req.method === 'PUT') {
    // Actualiza la información del usuario
    try {
      const updatedUser = await updateUserByEmail(email, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error en API user (PUT):', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
