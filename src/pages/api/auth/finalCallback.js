import cookie from 'cookie';

// Función auxiliar: realizar POST con x-www-form-urlencoded
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

    // Ajusta este redirectUri al que tengas configurado en Cognito
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/finalCallback';
    // Este es tu dominio de Hosted UI. Por ejemplo, "https://auth.total-remote-control.com"
    // o "https://xxxxx.auth.us-east-1.amazoncognito.com"
    const hostedUiDomain = 'https://auth.total-remote-control.com';

    // 1) Discovery manual: GET a `/.well-known/openid-configuration`
    const discoveryUrl = `${hostedUiDomain}/.well-known/openid-configuration`;
    const discoveryResp = await fetch(discoveryUrl);
    if (!discoveryResp.ok) {
      const errText = await discoveryResp.text();
      throw new Error(`No se pudo obtener la discovery: ${discoveryResp.status} - ${errText}`);
    }
    const discovered = await discoveryResp.json();

    console.log("Discovery manual:", discovered);

    if (!discovered.token_endpoint) {
      throw new Error("La discovery no devolvió token_endpoint; revisa tu dominio Hosted UI.");
    }

    // 2) Preparamos el body para el intercambio de code por tokens
    const body = {
      grant_type: 'authorization_code',
      code,
      client_id: '4fbadbb2qqj15u0vf5dmauudbj', // tu client_id de Cognito
      redirect_uri: redirectUri,
      // scope: 'openid profile email', // opcional si requieres
      // state, // opcional si Cognito lo requiere
    };

    // 3) Hacemos el POST al token_endpoint
    const tokensResponse = await postTokenEndpoint(discovered.token_endpoint, body);
    console.log("tokensResponse:", tokensResponse);

    if (!tokensResponse.id_token) {
      throw new Error("No se recibió id_token en la respuesta del token endpoint");
    }

    // 4) Guardar el id_token en una cookie httpOnly
    res.setHeader("Set-Cookie", cookie.serialize("idToken", tokensResponse.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
      sameSite: "strict",
    }));

    // 5) Redirigir a la raíz
    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
