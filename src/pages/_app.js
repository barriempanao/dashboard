import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch('/api/auth/check');
            const data = await response.json();

            if (data.authenticated) {
                setAuthenticated(true);
            } else {
                router.push('/api/auth/login');
            }
        };

        checkAuth();
    }, []);

    if (!authenticated) return <p>Cargando...</p>;

    return <Component {...pageProps} />;
}
