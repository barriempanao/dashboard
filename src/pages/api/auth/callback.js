// pages/api/auth/callback.js

import { Issuer } from 'openid-client';
import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    // Extraer los parámetros de la URL.
    // La URL completa está en req.url, que contiene el query string (después del ?)
    const queryString = req.url.split('?')[1];
    const params = new URLSearchParams(queryString);
    const code = params.get('code');
    const state = params.get('state');
    
    if (!code) {
      return res.status(400).json({ error: 'No se encontró el código de autorización' });
    }

    // Descubrir la configuración del issuer (Cognito)
    const issuer = await Issuer.discover('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u');
    
    // Configurar el cliente de OpenID Connect
    const client = new issuer.Client({
      client_id: '4fbadbb2qqj15u0vf5dmauudbj',
      // Cognito para aplicaciones web generalmente no usa client secret.
      redirect_uris: ['https://dashboard.total-remote-control.com/api/auth/callback'],
      response_types: ['code']
    });

    // Realizar el intercambio del código por tokens.
    // El primer parámetro es el redirect_uri que usaste, el segundo es la URL completa (req.url),
    // y el tercer parámetro es un objeto de verificación (aquí, solo usamos state).
    const tokenSet = await client.callback(
      'https://dashboard.total-remote-control.com/api/auth/callback',
      req.url,
      { state }
    );
    
    // Extraer el id_token del tokenSet
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
