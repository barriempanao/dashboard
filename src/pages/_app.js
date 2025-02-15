import '../styles/styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const [authenticated, setAuthenticated] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Verificación de autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (data.authenticated) {
          setAuthenticated(true);
        } else {
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

  // Manejo de eventos de cambio de ruta para mostrar el overlay "loading"
  useEffect(() => {
    const handleRouteChangeStart = () => setLoading(true);
    const handleRouteChangeComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

  // Mientras se verifica la autenticación, mostramos un loading simple
  if (authenticated === null) return <p>Cargando...</p>;

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <p>Loading...</p>
        </div>
      )}
      <Component {...pageProps} />
    </>
  );
}
