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

    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/finalCallback';

    // Asegúrate de usar tu "client_id" real
    const clientId = '4fbadbb2qqj15u0vf5dmauudbj';

    // Hard-coded token endpoint de Cognito
    // (normalmente: https://xxxx.auth.us-east-1.amazoncognito.com/oauth2/token)
    const tokenEndpoint = 'https://us-east-1b0tphm55u.auth.us-east-1.amazoncognito.com/oauth2/token';

    const body = {
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
    };

    const tokensResponse = await postTokenEndpoint(tokenEndpoint, body);
    console.log("tokensResponse:", tokensResponse);

    if (!tokensResponse.id_token) {
      throw new Error("No se recibió id_token en la respuesta del token endpoint");
    }

    res.setHeader("Set-Cookie", cookie.serialize("idToken", tokensResponse.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
      sameSite: "strict",
    }));

    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
