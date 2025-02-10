// src/pages/api/auth/callback.js
import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    // Next.js ya parsea la query automáticamente
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }
    
    // Definir el redirectUri (debe coincidir exactamente con el configurado en Cognito)
    const redirectUri = 'https://dashboard.total-remote-control.com/api/auth/callback';
    
    // Cargar la librería openid-client de forma dinámica
    const openidClientModule = await import('openid-client');
    console.log("openid-client module:", openidClientModule);
      
    
    // Intentar obtener Issuer de openid-client de dos formas: directamente o desde la propiedad default
    const Issuer = openidClientModule.Issuer || (openidClientModule.default && openidClientModule.default.Issuer);
    
    // Si no se pudo obtener Issuer, lanzar un error
    if (!Issuer) {
      throw new Error("No se pudo cargar Issuer desde openid-client");
    }
    
    // Descubrir la configuración de Cognito
    const issuer = await Issuer.discover('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u');
    
    // Configurar el cliente OpenID Connect (Cognito generalmente no usa client secret para aplicaciones web)
    const client = new issuer.Client({
      client_id: '4fbadbb2qqj15u0vf5dmauudbj',
      redirect_uris: [redirectUri],
      response_types: ['code']
    });
    
    // Realizar el intercambio del código por tokens, usando req.query
    const tokenSet = await client.callback(redirectUri, req.query, { state });
    
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
