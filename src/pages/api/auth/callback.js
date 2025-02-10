import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }

    // Debe coincidir con Cognito
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';

    // Dominio de tu Hosted UI, el que obtuviste en Cognito
    // Por ejemplo: "https://auth.total-remote-control.com" o "https://us-east-1b0tphm55u.auth.us-east-1.amazoncognito.com"
    const hostedUiDomain = 'https://auth.total-remote-control.com';

    // Carga dinámica de la librería
    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);

    // Extraemos 'discovery' y 'genericGrantRequest'
    const { discovery, genericGrantRequest } = openidClientModule;
    if (!discovery || !genericGrantRequest) {
      throw new Error("No se encontró 'discovery' o 'genericGrantRequest' en openid-client");
    }

    // Descubrir la config de Cognito con el dominio de la Hosted UI
    const discovered = await discovery(hostedUiDomain);
    console.log("discovered:", discovered);

    if (!discovered.token_endpoint) {
      throw new Error("La discovery no devolvió 'token_endpoint'. Verifica tu dominio Hosted UI.");
    }

    // Construimos un objeto URL a partir del token_endpoint descubierto
    const tokenEndpoint = new URL(discovered.token_endpoint);

    // Llamamos a genericGrantRequest con grant_type=authorization_code
    const result = await genericGrantRequest({
      server: tokenEndpoint,       // Debe ser un objeto URL
      grant_type: 'authorization_code',
      code,
      client_id: '4fbadbb2qqj15u0vf5dmauudbj', // Tu client_id en Cognito
      redirect_uri: redirectUri,
      // Puedes incluir 'scope' si lo necesitas, por ejemplo: scope: 'openid profile email'
      // state si quieres (ya lo tenemos en la URL).
      state,
    });

    console.log("genericGrantRequest result:", result);

    // 'result.body' contendrá los tokens devueltos por Cognito
    if (!result.body || !result.body.id_token) {
      throw new Error("No se obtuvo el id_token en la respuesta del token endpoint");
    }

    // Guardar el id_token en una cookie httpOnly
    res.setHeader("Set-Cookie", cookie.serialize("idToken", result.body.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
      sameSite: "strict",
    }));

    // Redirigir al usuario a la raíz
    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
