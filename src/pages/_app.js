import { useEffect, useState } from "react";

export default function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const session = sessionStorage.getItem("session");
      if (!session) {
        const cognitoLogin = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI}`;
        window.location.href = cognitoLogin;
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) return <p>Loading...</p>;

  return <Component {...pageProps} />;
}
