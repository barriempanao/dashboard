// pages/api/user.js
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getUserByEmail } from '../../lib/db';

// URL del JWKS de tu User Pool de Cognito
const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

// Crea el cliente JWKS
const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

// Función para obtener la clave pública
function getKey(header, callback) {
  console.log("[API USER] getKey - header recibido:", header);
  if (!header || !header.kid) {
    const errMsg = "Falta el header o el campo 'kid' en el token.";
    console.error("[API USER] getKey - ERROR:", errMsg);
    return callback(new Error(errMsg));
  }
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
    console.log('Variables de entorno:', process.env);

  try {
    // Intentamos obtener las cookies desde req.cookies (disponible en Next.js) o bien desde req.headers.cookie
    const cookies =
      req.cookies && Object.keys(req.cookies).length > 0
        ? req.cookies
        : req.headers.cookie
          ? cookie.parse(req.headers.cookie)
          : {};
    console.log("[API USER] Cookies parseadas:", cookies);

    const token = cookies.authToken;
    console.log("[API USER] authToken extraído:", token);

    if (!token) {
      console.error("[API USER] No se proporcionó token de autenticación.");
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // Antes de verificar, decodificamos sin validar para ver su estructura
    const decodedWithoutVerify = jwt.decode(token, { complete: true });
    console.log("[API USER] Token decodificado (sin verificar):", decodedWithoutVerify);

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
      console.log("[API USER] Token verificado y decodificado:", decoded);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado', details: err.message });
    }

    const email = decoded.email;
    console.log("[API USER] Email extraído del token:", email);

    if (!email) {
      console.error("[API USER] El token no contiene email.");
      return res.status(400).json({ error: 'El token no contiene email' });
    }

    // Consultamos la base de datos
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
