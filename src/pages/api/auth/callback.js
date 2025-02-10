// src/pages/api/auth/callback.js
import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    // Utiliza req.query que Next.js parsea automáticamente
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }
    
    // Definir el redirectUri de forma explícita
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';
    
    // Usar importación dinámica para cargar openid-client
    const { Issuer } = await import('openid-client');
    
    // Descubrir la configuración del issuer de Cognito
    const issuer = await Issuer.discover('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u');
    
    // Crear el cliente OpenID Connect
    const client = new issuer.Client({
      client_id: '4fbadbb2qqj15u0vf5dmauudbj',
      redirect_uris: [redirectUri],
      response_types: ['code']
    });
    
    // Realizar el intercambio del código por tokens utilizando req.query
    const tokenSet = await client.callback(redirectUri, req.query, { state });
    
    // Extraer el id_token
    const idToken = tokenSet.id_token;
    
    // Establecer una cookie httpOnly con el idToken
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
