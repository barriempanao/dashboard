import cookie from 'cookie';

// Función auxiliar para hacer un POST con x-www-form-urlencoded
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

    // Ajusta según tu config en Cognito:
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/finalCallback';
    // Hosted UI domain (por ej, "https://auth.total-remote-control.com" o "https://xxx.auth.us-east-1.amazoncognito.com")
    const hostedUiDomain = "https://auth.total-remote-control.com";

    // Carga dinámica de openid-client
    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);

    // Tomamos la función "discovery"
    const { discovery } = openidClientModule;
    if (!discovery) {
      throw new Error("No se encontró 'discovery' en openid-client");
    }

    // OJO: La librería oauth4webapi en su versión actual a veces requiere un objeto URL para discovery:
    // if te sale error 'server must be an instance of URL' con "discovery(hostedUiDomain)",
    // prueba "discovery(new URL(hostedUiDomain))" en vez de "discovery(hostedUiDomain)".
    // Vamos a hacer un check:

    let discovered;
    try {
      // PRIMERO: intenta con un string
      discovered = await discovery(hostedUiDomain);
    } catch (err) {
      if (err.message?.includes('"server" must be an instance of URL')) {
        // SEGUNDO: intenta con un objeto URL
        discovered = await discovery(new URL(hostedUiDomain));
      } else {
        throw err;
      }
    }

    console.log("discovered:", discovered);

    if (!discovered.token_endpoint) {
      throw new Error("La discovery no devolvió token_endpoint; revisa tu dominio Hosted UI");
    }

    // Preparamos el body del POST
    const body = {
      grant_type: 'authorization_code',
      code,
      client_id: '4fbadbb2qqj15u0vf5dmauudbj', // tu client_id
      redirect_uri: redirectUri,
      // scope: 'openid profile email', // si quieres
      // state, // si fuera necesario
    };

    // Hacemos el POST manual
    const tokensResponse = await postTokenEndpoint(discovered.token_endpoint, body);
    console.log("tokensResponse:", tokensResponse);

    if (!tokensResponse.id_token) {
      throw new Error("No se recibió id_token en la respuesta del token endpoint");
    }

    // Guardamos el id_token en cookie
    res.setHeader("Set-Cookie", cookie.serialize("idToken", tokensResponse.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
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
