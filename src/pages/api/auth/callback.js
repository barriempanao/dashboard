// src/pages/api/auth/callback.js
import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    // Next.js parsea la query automáticamente.
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }

    // Este redirectUri debe coincidir con el configurado en Cognito.
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';

    // Importación dinámica de la librería.
    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);

    // Usaremos la función 'discovery' para obtener la configuración de Cognito.
    // Nota: la propiedad 'Issuer' no está presente en tu versión, así que usamos 'discovery'.
    const { discovery, Client } = openidClientModule;

    if (!discovery || !Client) {
      throw new Error("No se encontró 'discovery' o 'Client' en openid-client");
    }

    // Descubrir la configuración de Cognito
    const discovered = await discovery('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u');
    console.log("discovered:", discovered);

    // 'discovered' debe contener al menos:
    // {
    //   issuer: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u",
    //   authorization_endpoint: "...",
    //   token_endpoint: "...",
    //   ...
    // }

    if (!discovered.issuer || !discovered.token_endpoint) {
      throw new Error("La discovery de Cognito no devolvió los endpoints esperados");
    }

    // Crear el cliente OpenID Connect usando la configuración descubierta
    const client = new Client({
      issuer: discovered.issuer,
      authorization_endpoint: discovered.authorization_endpoint,
      token_endpoint: discovered.token_endpoint,
      jwks_uri: discovered.jwks_uri,
      userinfo_endpoint: discovered.userinfo_endpoint,
      end_session_endpoint: discovered.end_session_endpoint,
      // Datos específicos de tu aplicación en Cognito:
      client_id: '4fbadbb2qqj15u0vf5dmauudbj',
      redirect_uris: [redirectUri],
      response_types: ['code']
    });

    // Intercambiar el código por tokens usando client.callback
    const tokenSet = await client.callback(redirectUri, { code, state }, { state });
    console.log("tokenSet:", tokenSet);

    // Extraer el id_token
    const idToken = tokenSet.id_token;

    // Establecer la cookie httpOnly con el idToken
    res.setHeader("Set-Cookie", cookie.serialize("idToken", idToken, {
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
