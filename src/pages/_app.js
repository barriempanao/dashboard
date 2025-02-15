// _app.js
import '../styles/styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const [authenticated, setAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Aseguramos que la petición incluya las cookies
        const response = await fetch('/api/auth/check', { credentials: 'include' });
        const data = await response.json();

        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          // Redirige a Cognito si no está autenticado
          window.location.href = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthenticated(false);
        window.location.href = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
      }
    };

    checkAuth();
  }, [router]);

  if (authenticated === null) return <p>Cargando...</p>;

  return <Component {...pageProps} />;
}
