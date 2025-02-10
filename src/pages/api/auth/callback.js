import { Issuer } from 'openid-client';
import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    // Extraer la parte de la query string de la URL (lo que viene después del '?')
    const queryString = req.url.split('?')[1];
    const params = new URLSearchParams(queryString);

    // Convertir los parámetros a un objeto
    const callbackParams = {};
    for (const [key, value] of params.entries()) {
      callbackParams[key] = value;
    }
    
    // Verificar que exista el código de autorización
    if (!callbackParams.code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }
    
    // Descubrir la configuración del issuer de Cognito
    const issuer = await Issuer.discover('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u');
    
    // Configurar el cliente OpenID Connect sin client secret (Cognito generalmente no lo usa para aplicaciones web)
    const client = new issuer.Client({
      client_id: '4fbadbb2qqj15u0vf5dmauudbj',
      redirect_uris: ['https://dashboard.total-remote-control.com/api/auth/callback'],
      response_types: ['code']
    });
    
    // Realizar el intercambio del código por tokens
    const tokenSet = await client.callback(
      'https://dashboard.total-remote-control.com/api/auth/callback',
      callbackParams,
      { state: callbackParams.state }
    );
    
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
