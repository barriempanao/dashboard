// _app.js
import '../styles/styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const [authenticated, setAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 [APP] Iniciando verificación de autenticación...");
      try {
        // Se hace la petición a /api/auth/check incluyendo las cookies
        const response = await fetch('/api/auth/check', { credentials: 'include' });
        console.log("🔍 [APP] Respuesta HTTP de /api/auth/check:", response);
        
        // Convertimos la respuesta a JSON
        const data = await response.json();
        console.log("🔍 [APP] Datos recibidos de /api/auth/check:", data);

        // Si data.authenticated es true, se marca como autenticado
        if (data.authenticated) {
          console.log("✅ [APP] Usuario autenticado.");
          setAuthenticated(true);
        } else {
          console.warn("⚠️ [APP] Usuario no autenticado, redirigiendo a Cognito...");
          // Redirige a Cognito para iniciar el login
          window.location.href = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
        }
      } catch (error) {
        console.error("❌ [APP] Error al verificar autenticación:", error);
        setAuthenticated(false);
        window.location.href = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
      }
    };

    checkAuth();
  }, [router]);

  if (authenticated === null) return <p>Cargando...</p>;

  // Si está correctamente autenticado, se renderiza el componente de la página.
  console.log("✅ [APP] Usuario autenticado, renderizando la aplicación.");
  return <Component {...pageProps} />;
}
