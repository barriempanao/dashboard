// con fetch Iker
import cookie from 'cookie';

// Función auxiliar para hacer un POST con x-www-form-urlencoded
async function postTokenEndpoint(tokenEndpoint, body) {
  // 'body' es un objeto con { grant_type, code, client_id, redirect_uri, ... }
  // convertimos a URLSearchParams
  const params = new URLSearchParams(body);

  const resp = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!resp.ok) {
    // Si el server respondió con 4xx o 5xx, lanzamos error
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
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';

    // Este es tu dominio de Hosted UI que ves en Cognito
    // Ej: "https://auth.total-remote-control.com" o "https://us-east-1b0tphm55u.auth.us-east-1.amazoncognito.com"
    const hostedUiDomain = "https://auth.total-remote-control.com";

    // Importamos dinámicamente openid-client
    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);

    const { discovery } = openidClientModule;
    if (!discovery) {
      throw new Error("No se encontró 'discovery' en openid-client");
    }

    // Descubrir la config (URLs) del IdP (Cognito) usando el dominio Hosted UI
    const discovered = await discovery(hostedUiDomain);
    console.log("discovered:", discovered);

    // El token_endpoint es la dirección adonde hacemos POST para intercambiar el code por tokens
    const tokenEndpoint = discovered.token_endpoint;
    if (!tokenEndpoint) {
      throw new Error("No se encontró 'token_endpoint' en la discovery. Verifica que el dominio sea correcto.");
    }

    // Construimos el cuerpo de la petición (grant_type=authorization_code)
    const body = {
      grant_type: 'authorization_code',
      code,
      client_id: '4fbadbb2qqj15u0vf5dmauudbj', // tu client_id
      redirect_uri: redirectUri
      // Podrías incluir 'scope' si lo requieres: scope: 'openid profile email'
      // e incluso 'state' si Cognito lo requiere, pero usualmente no es obligatorio
    };

    // Hacemos la llamada POST manual con fetch
    const tokensResponse = await postTokenEndpoint(tokenEndpoint, body);
    console.log("tokensResponse:", tokensResponse);

    // Deberíamos tener { access_token, id_token, token_type, expires_in, ...}
    if (!tokensResponse.id_token) {
      throw new Error("No se obtuvo id_token en la respuesta del token endpoint.");
    }

    // Guardamos el id_token en cookie httpOnly
    res.setHeader("Set-Cookie", cookie.serialize("idToken", tokensResponse.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hora
      path: "/",
      sameSite: "strict",
    }));

    // Redirigimos a la raíz
    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
