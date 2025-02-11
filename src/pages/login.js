// pages/login.js
import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    window.location.href = '/api/auth/login';
  }, []);

  return <p>Redirigiendo...</p>;
}
