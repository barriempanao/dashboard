// pages/api/auth/callback.js
import { serialize } from 'cookie';

export default async function handler(req, res) {
  console.log("🔔 [CALLBACK] Inicio del callback.");
  console.log("🔔 [CALLBACK] Query parameters recibidos:", req.query);

  if (!req.query.code) {
    console.error("❌ [CALLBACK] No se encontró el parámetro 'code' en la query.");
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const tokenEndpoint = `${process.env.COGNITO_DOMAIN}/oauth2/token`;
    console.log("🔔 [CALLBACK] Intercambiando código por token en:", tokenEndpoint);
    console.log("🔔 [CALLBACK] Datos enviados al token endpoint:", {
      grant_type: 'authorization_code',
      client_id: process.env.COGNITO_CLIENT_ID,
      redirect_uri: process.env.COGNITO_REDIRECT_URI,
      code: req.query.code,
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.COGNITO_CLIENT_ID,
        redirect_uri: process.env.COGNITO_REDIRECT_URI,
        code: req.query.code,
      }),
    });

    console.log("🔔 [CALLBACK] Status de la respuesta del token endpoint:", response.status);
    const data = await response.json();
    console.log("🔔 [CALLBACK] Respuesta del token endpoint:", data);

    if (!data.id_token) {
      console.error("❌ [CALLBACK] No se recibió id_token. Respuesta:", data);
      return res.status(400).json({ error: 'No token received' });
    }

    console.log("🔔 [CALLBACK] Estableciendo cookie 'authToken'.");
    const cookie = serialize('authToken', data.id_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      domain: process.env.COOKIE_DOMAIN, // Asegúrate de que COOKIE_DOMAIN esté definido correctamente, por ejemplo: "dashboard.total-remote-control.com"
      maxAge: 60 * 60 * 24, // 1 día
    });
    console.log("🔔 [CALLBACK] Cookie creada:", cookie);
    res.setHeader('Set-Cookie', cookie);

    console.log("🔔 [CALLBACK] Redirigiendo a '/'");
    res.redirect(302, '/');
  } catch (error) {
    console.error('❌ [CALLBACK] Error en el callback:', error);
    return res.status(500).json({ error: 'Error processing authentication' });
  }
}
