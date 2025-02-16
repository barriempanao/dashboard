// pages/api/licenses.js
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getUserByEmail, getLicensesByUserId } from '../../lib/db';

// URL del JWKS de tu User Pool de Cognito
const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

// Crea el cliente JWKS
const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

// Función para obtener la clave pública
function getKey(header, callback) {
  console.log("[API LICENSES] getKey - header recibido:", header);
  if (!header || !header.kid) {
    const errMsg = "Falta el header o el campo 'kid' en el token.";
    console.error("[API LICENSES] getKey - ERROR:", errMsg);
    return callback(new Error(errMsg));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("[API LICENSES] Error en getSigningKey:", err);
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      console.log("[API LICENSES] getKey - signingKey obtenido:", signingKey);
      callback(null, signingKey);
    }
  });
}

export default async function handler(req, res) {
  console.log("[API LICENSES] Inicio del handler.");
  console.log("[API LICENSES] Headers recibidos:", req.headers);
  console.log("Variables de entorno:", process.env);

  try {
    // Obtenemos las cookies
    const cookies =
      req.cookies && Object.keys(req.cookies).length > 0
        ? req.cookies
        : req.headers.cookie
          ? cookie.parse(req.headers.cookie)
          : {};
    console.log("[API LICENSES] Cookies parseadas:", cookies);

    const token = cookies.authToken;
    console.log("[API LICENSES] authToken extraído:", token);

    if (!token) {
      console.error("[API LICENSES] No se proporcionó token de autenticación.");
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // Decodificamos el token sin verificar para ver su estructura
    const decodedWithoutVerify = jwt.decode(token, { complete: true });
    console.log("[API LICENSES] Token decodificado (sin verificar):", decodedWithoutVerify);

    let decoded;
    try {
      decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
          if (err) {
            console.error("[API LICENSES] Error al verificar el token:", err);
            return reject(err);
          }
          resolve(decodedToken);
        });
      });
      console.log("[API LICENSES] Token verificado y decodificado:", decoded);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado', details: err.message });
    }

    const email = decoded.email;
    console.log("[API LICENSES] Email extraído del token:", email);

    if (!email) {
      console.error("[API LICENSES] El token no contiene email.");
      return res.status(400).json({ error: 'El token no contiene email' });
    }

    // Consultamos la base de datos para obtener los datos del usuario (necesarios para extraer su user_id)
    const userData = await getUserByEmail(email);
    console.log("[API LICENSES] Datos del usuario obtenidos de la DB:", userData);

    if (!userData) {
      console.error("[API LICENSES] Usuario no encontrado para el email:", email);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Consultamos la base de datos para obtener las licencias asociadas al usuario
    const licenses = await getLicensesByUserId(userData.user_id);
    console.log("[API LICENSES] Licencias obtenidas para el usuario:", licenses);

    return res.status(200).json(licenses);
  } catch (error) {
    console.error("[API LICENSES] Error en el handler:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
