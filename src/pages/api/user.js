// pages/api/user.js
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getUserByEmail } from '../../lib/db';

// Define la URL del JWKS de tu User Pool de Cognito.
// Asegúrate de reemplazar "us-east-1_b0tpHM55u" con el ID de tu User Pool.
const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

// Crea un cliente JWKS
const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

// Función para obtener la clave de verificación usando el "kid" del token
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
  try {
    // Parsea las cookies de forma segura
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.authToken;
    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // Verifica el token usando la función getKey para obtener la clave pública desde Cognito
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

    // Consulta la base de datos para obtener los datos del usuario
    const userData = await getUserByEmail(email);
    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error en API user:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
