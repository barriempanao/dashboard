import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }

    // Debe coincidir con el registrado en Cognito
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';

    // Carga dinámica de openid-client
    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);

    const { discovery, authorizationCodeGrant } = openidClientModule;
    if (!discovery || !authorizationCodeGrant) {
      throw new Error("No se encontró 'discovery' o 'authorizationCodeGrant' en openid-client");
    }

    // 1) Descubrir la configuración de Cognito
    const discovered = await discovery('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u');
    console.log("discovered:", discovered);

    if (!discovered.issuer || !discovered.token_endpoint) {
      throw new Error("La discovery de Cognito no devolvió endpoints esperados");
    }

    // 2) authorizationCodeGrant requiere 'server' como objeto URL que apunte al token endpoint
    const tokenEndpointUrl = new URL(discovered.token_endpoint);

    // 3) Llamada a authorizationCodeGrant
    const result = await authorizationCodeGrant({
      // 'server' debe ser el token endpoint en forma de URL
      server: tokenEndpointUrl,
      code,
      state,
      client_id: '4fbadbb2qqj15u0vf5dmauudbj', // tu client_id de Cognito
      redirect_uri: redirectUri,
      // Si fuera necesario, podrías pasar issuer: discovered.issuer, pero se ve que la librería
      // principalmente requiere server para token endpoint.
    });

    console.log("authorizationCodeGrant result:", result);

    // result.tokens debería contener access_token, id_token, etc.
    if (!result.tokens || !result.tokens.id_token) {
      throw new Error("No se obtuvo el id_token al intercambiar el code");
    }

    // Guardamos el id_token en una cookie
    res.setHeader("Set-Cookie", cookie.serialize("idToken", result.tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hora
      path: "/",
      sameSite: "strict",
    }));

    // Redirigimos al usuario a la raíz
    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
