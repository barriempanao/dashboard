import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";

const cleanUrl = (url) => url.replace(/\/+$/, ""); // Elimina barras finales

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Intentar obtener el token desde sessionStorage y cookies
      const token = sessionStorage.getItem("authToken") || document.cookie.split('; ').find(row => row.startsWith("authToken="));

      if (!token) {
        console.log("Usuario no autenticado, redirigiendo...");
        const cognitoLogin = `${cleanUrl(process.env.NEXT_PUBLIC_COGNITO_DOMAIN)}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(cleanUrl(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI))}`;
        router.replace(cognitoLogin);
      }
    };

    checkAuth();
  }, [router]);

  return <Component {...pageProps} />;
};

export default MyApp;
