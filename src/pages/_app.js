import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = sessionStorage.getItem('session');
      if (!session) {
        window.location.href = `${process.env.COGNITO_DOMAIN}/login?client_id=${process.env.COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${process.env.COGNITO_REDIRECT_URI}`;
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) return <p>Loading...</p>;

  return <Component {...pageProps} />;
}
