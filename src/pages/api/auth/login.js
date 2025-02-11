// pages/api/auth/login.js

import crypto from 'crypto';
import cookie from 'cookie';

console.log("Cookie library import check:", cookie);
console.log("Available keys in cookie module:", Object.keys(cookie || {}));

export default async function handler(req, res) {
  try {
    // 1. Generar code_verifier aleatorio
    const codeVerifier = crypto.randomBytes(32).toString("hex");

    // 2. Calcular code_challenge (S256)
    function base64URLEncode(str) {
      return str
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    function sha256(buffer) {
      return crypto.createHash('sha256').update(buffer).digest();
    }
    const codeChallenge = base64URLEncode(sha256(codeVerifier));

    // 3. Guardar el codeVerifier en una cookie (HTTP-only).
    // Ajusta las opciones de la cookie según tu dominio y necesidades.
    // Nota: sameSite:'strict' a veces produce problemas en flujos OIDC cross-site,
    // podrías usar 'lax' o 'none'. Ajusta 'domain' si usas subdominios.
    res.setHeader('Set-Cookie', cookie.serialize('codeVerifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // domain: 'total-remote-control.com' // <-- Descomenta si necesitas compartir la cookie en subdominios
    }));

    // 4. Construir la URL de autorización de Cognito
    const clientId = '4fbadbb2qqj15u0vf5dmauudbj'; // tu client_id
    const cognitoDomain = 'us-east-1b0tphm55u.auth.us-east-1.amazoncognito.com'; // tu dominio de Cognito
    const redirectUri = encodeURIComponent('https://dashboard.total-remote-control.com/api/auth/finalCallback');
    const responseType = 'code';
    const scope = encodeURIComponent('email openid profile');
    const codeChallengeMethod = 'S256';

    const authorizationUrl = `https://${cognitoDomain}/oauth2/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge_method=${codeChallengeMethod}&code_challenge=${codeChallenge}`;

    // 5. Redirigir al usuario al Hosted UI de Cognito
    return res.redirect(authorizationUrl);

  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return res.status(500).json({ error: 'Error iniciando login con Cognito' });
  }
}
