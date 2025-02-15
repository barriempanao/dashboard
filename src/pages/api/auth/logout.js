// pages/api/auth/logout.js
export default function handler(req, res) {
  // Borra la cookie usando las mismas opciones con las que se estableció
  res.setHeader(
    'Set-Cookie',
    `authToken=; Path=/; HttpOnly; Secure; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  // Construye la URL de logout de Cognito
  const cognitoLogoutURL = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;

  // Redirige a Cognito para cerrar sesión también allí
  res.redirect(cognitoLogoutURL);
}
