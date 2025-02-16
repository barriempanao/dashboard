// pages/api/auth/check.js
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const COGNITO_JWKS_URL =
  process.env.COGNITO_JWKS_URL ||
  'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

// Función para obtener la clave pública (signing key) usando el 'kid'
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
  console.log("🔍 [CHECK] Headers recibidos:", req.headers);
  console.log("🔍 [CHECK] Cookies recibidas:", req.headers.cookie);

  const authToken = req.cookies.authToken;
  console.log("🔍 [CHECK] authToken extraído:", authToken);

  if (!authToken) {
    return res.status(401).json({ authenticated: false, error: "Token missing" });
  }

  try {
    // Verifica el token usando la clave obtenida vía JWKS y el algoritmo RS256
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(authToken, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) return reject(err);
        resolve(decodedToken);
      });
    });

    console.log("🔍 [CHECK] Token verificado correctamente:", decoded);
    return res.status(200).json({ authenticated: true, tokenData: decoded });
  } catch (error) {
    console.error("🔍 [CHECK] Error al verificar el token:", error);
    return res.status(401).json({ authenticated: false, error: error.message });
  }
}









/*
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Usa la URL del JWKS de tu User Pool de Cognito (ajústala si es necesario)
const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

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
  console.log("🔍 [CHECK] Headers recibidos:", req.headers);
  console.log("🔍 [CHECK] Cookies recibidas:", req.headers.cookie);

  const authToken = req.cookies.authToken;
  console.log("🔍 [CHECK] authToken extraído:", authToken);

  if (!authToken) {
    return res.json({ authenticated: false });
  }

  try {
    // Verificamos el token usando la clave obtenida vía JWKS
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(authToken, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) {
          return reject(err);
        }
        resolve(decodedToken);
      });
    });

    console.log("🔍 [CHECK] Token verificado correctamente:", decoded);
    return res.json({ authenticated: true });
  } catch (error) {
    console.error("🔍 [CHECK] Error al verificar el token:", error);
    return res.json({ authenticated: false });
  }
}


*/
