import '../styles/globals.css';
import { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import awsConfig from "../aws-exports";

const LOGIN_URL = "https://auth.total-remote-control.com/login?client_id=4fbadbb2qqj15u0vf5dmauudbj&response_type=code&scope=email+openid+profile&redirect_uri=https%3A%2F%2Fdashboard.total-remote-control.com/";

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Para evitar SSR
    if (typeof window === 'undefined') return;

    // Configura Amplify solo en cliente
    Amplify.configure(awsConfig);

    const checkAuth = async () => {
      try {
        const { Auth } = await import("aws-amplify");
        const user = await Auth.currentAuthenticatedUser();
        console.log("✅ Usuario autenticado:", user);
        sessionStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        console.error("⚠️ Error en autenticación:", error);
        sessionStorage.removeItem("user");
        window.location.href = LOGIN_URL;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return <Component {...pageProps} />;
}

export default MyApp;
