import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }

    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';

    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);

    const { discovery, authorizationCodeGrant } = openidClientModule;
    if (!discovery || !authorizationCodeGrant) {
      throw new Error("No se encontró 'discovery' o 'authorizationCodeGrant' en openid-client");
    }

    
    const discovered = await discovery("https://auth.total-remote-control.com");
    console.log("discovered:", discovered);

    if (!discovered.token_endpoint) {
      throw new Error("La discovery de Cognito no devolvió token_endpoint");
    }

    const tokenEndpointUrl = new URL(discovered.token_endpoint);

    const result = await authorizationCodeGrant({
      server: tokenEndpointUrl,
      code,
      state,
      client_id: '4fbadbb2qqj15u0vf5dmauudbj',
      redirect_uri: redirectUri,
    });
    console.log("authorizationCodeGrant result:", result);

    if (!result.tokens || !result.tokens.id_token) {
      throw new Error("No se obtuvo el id_token al intercambiar el code");
    }

    res.setHeader("Set-Cookie", cookie.serialize("idToken", result.tokens.id_token, {
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
