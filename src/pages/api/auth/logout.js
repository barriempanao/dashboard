// pages/api/auth/logout.js
export default function handler(req, res) {
  // Asegúrate de que las opciones coincidan con las usadas para establecer la cookie.
  res.setHeader('Set-Cookie', `authToken=; Path=/; HttpOnly; Secure; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  res.status(200).json({ message: 'Logout successful' });
}
