// pages/api/auth/logout.js
import { NextResponse } from 'next/server';

export default function handler(req, res) {
  // Para borrar la cookie, se envía una cookie con la misma clave y una fecha de expiración pasada.
  res.setHeader('Set-Cookie', `authToken=; Path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  res.status(200).json({ message: 'Logout successful' });
}
