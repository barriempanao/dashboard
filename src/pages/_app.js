import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = document.cookie.split("; ").find(row => row.startsWith("access_token="));

    if (!token) {
      router.push("https://auth.total-remote-control.com/login/continue?client_id=4fbadbb2qqj15u0vf5dmauudbj&response_type=code&scope=email+openid+profile&redirect_uri=https%3A%2F%2Fdashboard.total-remote-control.com%2Fapi%2Fauth%2Fcallback");
    } else {
      setAuthenticated(true);
    }
  }, []);

  if (!authenticated) return <p>Loading...</p>;

  return <Component {...pageProps} />;
}

export default MyApp;
