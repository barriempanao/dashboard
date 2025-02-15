// pages/api/user.js
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getUserByEmail } from '../../lib/db';

// URL del JWKS de Cognito (reemplaza si es necesario)
const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

// Crea un cliente JWKS para obtener la clave pública dinámicamente
const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

// Función para obtener la clave pública usando el "kid" del token
function getKey(header, callback) {
  console.log("[API USER] getKey - header recibido:", header);
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("[API USER] Error en getSigningKey:", err);
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      console.log("[API USER] getKey - signingKey obtenido:", signingKey);
      callback(null, signingKey);
    }
  });
}

export default async function handler(req, res) {
  console.log("[API USER] Inicio del handler.");
  console.log("[API USER] Headers recibidos:", req.headers);

  try {
    // Obtiene la cadena de cookies
    const rawCookies = req.headers.cookie;
    console.log("[API USER] rawCookies:", rawCookies);

    // Parsea las cookies si existen
    const cookies = rawCookies ? cookie.parse(rawCookies) : {};
    console.log("[API USER] Cookies parseadas:", cookies);

    const token = cookies.authToken;
    console.log("[API USER] authToken extraído:", token);

    if (!token) {
      console.error("[API USER] No se proporcionó token de autenticación.");
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // Verifica el token usando Cognito y obtiene la clave pública dinámicamente
    let decoded;
    try {
      decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
          if (err) {
            console.error("[API USER] Error al verificar el token:", err);
            reject(err);
          } else {
            resolve(decodedToken);
          }
        });
      });
      console.log("[API USER] Token decodificado:", decoded);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado', details: err.message });
    }

    const email = decoded.email;
    console.log("[API USER] Email extraído del token:", email);

    if (!email) {
      console.error("[API USER] El token no contiene email.");
      return res.status(400).json({ error: 'El token no contiene email' });
    }

    // Consulta la base de datos para obtener los datos reales del usuario
    const userData = await getUserByEmail(email);
    console.log("[API USER] Datos del usuario obtenidos de la DB:", userData);

    if (!userData) {
      console.error("[API USER] Usuario no encontrado para el email:", email);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json(userData);
  } catch (error) {
    console.error("[API USER] Error en el handler:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
