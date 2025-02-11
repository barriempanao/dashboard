// pages/api/auth/finalCallback.js
import cookie from 'cookie';

// Función auxiliar para hacer el POST al token endpoint
async function postTokenEndpoint(tokenEndpoint, body) {
  const params = new URLSearchParams(body);
  const resp = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Token endpoint error: ${resp.status} - ${errText}`);
  }
  return resp.json();
}

export default async function handler(req, res) {
  try {
    // 1. Obtener el "code" de la querystring
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización en la URL' });
    }

    // 2. Recuperar la cookie con codeVerifier
    const cookies = cookie.parse(req.headers.cookie || '');
    const codeVerifier = cookies.codeVerifier;
    if (!codeVerifier) {
      throw new Error('No se encontró el code_verifier en la cookie');
    }

    // 3. Configurar la data para el token endpoint de Cognito
    const clientId = '4fbadbb2qqj15u0vf5dmauudbj'; // Reemplaza con tu client_id
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/finalCallback';

    // Revisa tu "User Pool domain":
    // us-east-1b0tphm55u.auth.us-east-1.amazoncognito.com
    const tokenEndpoint = `https://us-east-1b0tphm55u.auth.us-east-1.amazoncognito.com/oauth2/token`;

    const bodyParams = {
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    };

    // 4. Intercambiar el code + code_verifier por tokens
    const tokensResponse = await postTokenEndpoint(tokenEndpoint, bodyParams);
    console.log("tokensResponse:", tokensResponse);

    if (!tokensResponse.id_token) {
      throw new Error('No se recibió id_token en la respuesta del token endpoint');
    }

    // OPCIONAL: si quieres manejar también el "refresh_token" y "access_token"
    // const { id_token, access_token, refresh_token, expires_in, token_type } = tokensResponse;

    // 5. Guardar tokens en cookies HTTP-only (ejemplo: solo el id_token)
    res.setHeader("Set-Cookie", [
      cookie.serialize("idToken", tokensResponse.id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hora
        path: "/",
        sameSite: "lax",
      }),
      // Si quieres también un refresh_token o access_token, setéalos aquí
      // cookie.serialize("refreshToken", refresh_token, {...}),
      // cookie.serialize("accessToken", access_token, {...}),
    ]);

    // 6. Redirigir al usuario donde quieras (por ejemplo, al dashboard)
    res.writeHead(302, { Location: "/dashboard" });
    res.end();

  } catch (error) {
    console.error("Error en el callback de auth:", error);
    return res.status(500).json({ error: "Error en autenticación" });
  }
}
