import cookie from 'cookie';

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
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }

    // Recupera la cookie "codeVerifier" que guardamos en el login
    const cookies = cookie.parse(req.headers.cookie || '');
    const codeVerifier = cookies.codeVerifier;
    if (!codeVerifier) {
      throw new Error("No se encontró el code_verifier");
    }

    // Configura tus datos (asegúrate de que estos valores coincidan con los configurados en Cognito)
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/finalCallback';
    const clientId = '4fbadbb2qqj15u0vf5dmauudbj'; // Reemplaza con tu client_id real
    // Endpoint del token (verifica que el dominio sea el correcto de tu User Pool)
    const tokenEndpoint = 'https://us-east-1b0tphm55u.auth.us-east-1.amazoncognito.com/oauth2/token';

    const bodyParams = {
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    };

    const tokensResponse = await postTokenEndpoint(tokenEndpoint, bodyParams);
    console.log("tokensResponse:", tokensResponse);

    if (!tokensResponse.id_token) {
      throw new Error("No se recibió id_token en la respuesta del token endpoint");
    }

    // Guarda el id_token en una cookie para futuras solicitudes
    res.setHeader("Set-Cookie", cookie.serialize("idToken", tokensResponse.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hora (ajusta según necesites)
      path: "/",
      sameSite: "strict",
    }));

    // Redirige al usuario a la página de inicio
    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
