// pages/auth/callback.js
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../../lib/db';
import Layout from '../../components/Layout';

export async function getServerSideProps(context) {
  const { req, query, res } = context;

  // Si no se recibe el código, muestra un error 404
  if (!query.code) {
    return { notFound: true };
  }

  // Construye la URL del token endpoint de Cognito
  const tokenEndpoint = `${process.env.COGNITO_DOMAIN}/oauth2/token`;
  console.log("🔔 [CALLBACK PAGE] Intercambiando código por token en:", tokenEndpoint);
  console.log("🔔 [CALLBACK PAGE] Datos enviados al token endpoint:", {
    grant_type: 'authorization_code',
    client_id: process.env.COGNITO_CLIENT_ID,
    redirect_uri: process.env.COGNITO_REDIRECT_URI,
    code: query.code,
  });

  // Envía la solicitud POST a Cognito para intercambiar el código por un token
  const tokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.COGNITO_CLIENT_ID,
      redirect_uri: process.env.COGNITO_REDIRECT_URI,
      code: query.code,
    }),
  });

  console.log("🔔 [CALLBACK PAGE] Status de la respuesta del token endpoint:", tokenResponse.status);
  const tokenData = await tokenResponse.json();
  console.log("🔔 [CALLBACK PAGE] Respuesta del token endpoint:", tokenData);

  if (!tokenData.id_token) {
    console.error("❌ [CALLBACK PAGE] No se recibió id_token. Respuesta:", tokenData);
    return { notFound: true };
  }

  // Establece la cookie "authToken" con el id_token recibido
  const cookie = serialize('authToken', tokenData.id_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/',
    domain: process.env.COOKIE_DOMAIN, // Asegúrate de que COOKIE_DOMAIN sea "dashboard.total-remote-control.com"
    maxAge: 60 * 60 * 24, // 1 día
  });
  console.log("🔔 [CALLBACK PAGE] Cookie creada:", cookie);
  res.setHeader('Set-Cookie', cookie);

  // Decodifica el id_token para obtener el email del usuario
  const decoded = jwt.decode(tokenData.id_token);
  const email = decoded?.email;
  console.log("🔔 [CALLBACK PAGE] Email extraído del token:", email);

  // Obtiene los datos del usuario de la base de datos
  let userData = await getUserByEmail(email);
  console.log("🔔 [CALLBACK PAGE] Datos del usuario:", userData);

  // Si no se encuentran datos, se puede optar por un valor por defecto
  if (!userData) {
    userData = { email, first_name: "", last_name: "", phone: "", address: "", tax_identifier: "", country: "", date_of_birth: "" };
  }

  // Retorna los datos del usuario como props para renderizar la página
  return {
    props: { user: userData },
  };
}

export default function CallbackPage({ user }) {
  // Esta página se renderiza inmediatamente después del intercambio, con la cookie ya establecida.
  // Aquí puedes optar por redirigir automáticamente al usuario a /dashboard/account o
  // renderizar la vista de la cuenta directamente.

  // Opción 1: Renderizar directamente la cuenta
  return (
          /*
    <Layout>
      <h1>Cuenta del Usuario</h1>
      <div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Teléfono:</strong> {user.phone}</p>
        <p><strong>Dirección:</strong> {user.address}</p>
        <p><strong>Identificación Fiscal:</strong> {user.tax_identifier}</p>
        <p><strong>País:</strong> {user.country}</p>
        <p><strong>Fecha de Nacimiento:</strong> {user.date_of_birth}</p>
      </div>
    </Layout>
  );*/

  // Opción 2: Redirigir a /dashboard/account automáticamente (descomenta la siguiente línea)
   if (typeof window !== 'undefined') { window.location.href = '/dashboard/account'; }
   return null;
}

/*
// pages/api/auth/callback.js
import { serialize } from 'cookie';

export default async function handler(req, res) {
  console.log("🔔 [CALLBACK] Inicio del callback.");
  console.log("🔔 [CALLBACK] Query parameters recibidos:", req.query);

  if (!req.query.code) {
    console.error("❌ [CALLBACK] No se encontró el parámetro 'code' en la query.");
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const tokenEndpoint = `${process.env.COGNITO_DOMAIN}/oauth2/token`;
    console.log("🔔 [CALLBACK] Intercambiando código por token en:", tokenEndpoint);
    console.log("🔔 [CALLBACK] Datos enviados al token endpoint:", {
      grant_type: 'authorization_code',
      client_id: process.env.COGNITO_CLIENT_ID,
      redirect_uri: process.env.COGNITO_REDIRECT_URI,
      code: req.query.code,
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.COGNITO_CLIENT_ID,
        redirect_uri: process.env.COGNITO_REDIRECT_URI,
        code: req.query.code,
      }),
    });

    console.log("🔔 [CALLBACK] Status de la respuesta del token endpoint:", response.status);
    const data = await response.json();
    console.log("🔔 [CALLBACK] Respuesta del token endpoint:", data);

    if (!data.id_token) {
      console.error("❌ [CALLBACK] No se recibió id_token. Respuesta:", data);
      return res.status(400).json({ error: 'No token received' });
    }

    console.log("🔔 [CALLBACK] Estableciendo cookie 'authToken'.");
    const cookie = serialize('authToken', data.id_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      domain: process.env.COOKIE_DOMAIN, // Ej.: "dashboard.total-remote-control.com"
      maxAge: 60 * 60 * 24, // 1 día
    });
    console.log("🔔 [CALLBACK] Cookie creada:", cookie);
    res.setHeader('Set-Cookie', cookie);

    // Redirige a account con el parámetro justLoggedIn
    console.log("🔔 [CALLBACK] Redirigiendo a '/dashboard/account?justLoggedIn=1'");
    res.redirect(303, 'https://dashboard.total-remote-control.com/dashboard/account?justLoggedIn=1');
  } catch (error) {
    console.error('❌ [CALLBACK] Error en el callback:', error);
    return res.status(500).json({ error: 'Error processing authentication' });
  }
}
*/
