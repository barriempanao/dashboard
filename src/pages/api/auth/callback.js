// src/pages/api/auth/callback.js

import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    // Next.js parsea la query automáticamente.
    const { code, state } = req.query;

    // Verificamos que exista 'code'.
    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }

    // El redirectUri debe coincidir con lo registrado en Cognito.
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';

    // Importación dinámica de openid-client.
    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);

    // De la librería, usaremos 'discovery' y 'authorizationCodeGrant'.
    const { discovery, authorizationCodeGrant } = openidClientModule;

    if (!discovery || !authorizationCodeGrant) {
      throw new Error("No se encontró 'discovery' o 'authorizationCodeGrant' en openid-client");
    }

    // 1) Descubrir la configuración de Cognito
    //    (https://cognito-idp.{region}.amazonaws.com/{userPoolId})
    const discovered = await discovery('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u');
    console.log("discovered:", discovered);

    // discovered debería contener { issuer, token_endpoint, authorization_endpoint, ... }.
    // Verificamos que existan al menos 'issuer' y 'token_endpoint'.
    if (!discovered.issuer || !discovered.token_endpoint) {
      throw new Error("La discovery de Cognito no devolvió endpoints esperados");
    }

    // 2) Llamamos a authorizationCodeGrant para hacer el intercambio de 'code' por tokens.
    //    Pasamos los datos que Cognito necesita:
    const result = await authorizationCodeGrant({
      // Parámetros de la petición:
      code,              // el código de autorización
      state,             // el state devuelto por Cognito
      client_id: '4fbadbb2qqj15u0vf5dmauudbj',  // tu client_id
      issuer: discovered.issuer,               // URL base del issuer
      token_endpoint: discovered.token_endpoint,
      authorization_endpoint: discovered.authorization_endpoint,
      redirect_uri: redirectUri,
    });
    console.log("authorizationCodeGrant result:", result);

    // 'result' debería contener un objeto con la propiedad tokens, por ejemplo:
    // {
    //   tokens: {
    //     access_token, refresh_token, id_token, ...
    //   },
    //   ...
    // }
    const { tokens } = result;
    if (!tokens || !tokens.id_token) {
      throw new Error("No se obtuvo el id_token al intercambiar el code");
    }

    // Establecer la cookie httpOnly con el idToken
    res.setHeader("Set-Cookie", cookie.serialize("idToken", tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hora
      path: "/",
      sameSite: "strict",
    }));

    // Redirigir al usuario a la página principal
    res.writeHead(302, { Location: "/" });
    res.end();
  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
