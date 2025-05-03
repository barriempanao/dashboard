import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const COGNITO_JWKS_URL =
  process.env.COGNITO_JWKS_URL ||
  'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

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
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
      const [k, v] = c.trim().split('=');
      return [k, decodeURIComponent(v)];
    }));

    const token = cookies.authToken || cookies.id_token;
    if (!token) {
      console.warn("⚠️ No se encontró token ni en 'authToken' ni en 'id_token'.");
      return res.status(200).json({ authenticated: false });
    }

    // Validar token con clave pública de Cognito
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) return reject(err);
        resolve(decodedToken);
      });
    });

    console.log("✅ Token verificado correctamente:", decoded);

    if (decoded && decoded.email) {
      return res.status(200).json({ authenticated: true, email: decoded.email });
    } else {
      return res.status(200).json({ authenticated: false });
    }

  } catch (error) {
    console.error("❌ Error al verificar token:", error);
    return res.status(401).json({ authenticated: false, error: error.message });
  }
}
