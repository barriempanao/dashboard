export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; Max-Age=0');
  res.redirect(`${process.env.COGNITO_DOMAIN}/logout?client_id=${process.env.COGNITO_CLIENT_ID}&logout_uri=${process.env.COGNITO_REDIRECT_URI}`);
}
