import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }

    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';

    // Importar dinámicamente openid-client
    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);

    // Extraer las funciones que necesitamos
    const { discovery, authorizationCodeGrant } = openidClientModule;
    if (!discovery || !authorizationCodeGrant) {
      throw new Error("No se encontró 'discovery' o 'authorizationCodeGrant' en openid-client");
    }

    // Descubrir la configuración de Cognito
    const discovered = await discovery('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u');
    console.log("discovered:", discovered);

    // Comprobamos que devuelva al menos issuer y token_endpoint
    if (!discovered.issuer || !discovered.token_endpoint) {
      throw new Error("La discovery de Cognito no devolvió endpoints esperados");
    }

    // Construimos el objeto URL con el issuer
    const serverUrl = new URL(discovered.issuer);  // "server" debe ser un objeto de tipo URL

    // Realizamos el intercambio (authorization code grant)
    const result = await authorizationCodeGrant({
      server: serverUrl,             // Debe ser un objeto URL
      code,                          // El código devuelto por Cognito
      state,                         // El state devuelto
      client_id: '4fbadbb2qqj15u0vf5dmauudbj', // Tu client_id
      redirect_uri: redirectUri,     // Debe coincidir con Cognito
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

    // Redirigimos a la home
    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
