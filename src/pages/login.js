// pages/login.js
import { useEffect } from "react";
import { UserManager } from "oidc-client-ts";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u",
  client_id: "4fbadbb2qqj15u0vf5dmauudbj",
  // El redirect_uri debe coincidir con el que configuraste en el callback:
  redirect_uri: "https://dashboard.total-remote-control.com/api/auth/finalCallback",
  response_type: "code",
  scope: "email openid profile",
};

const userManager = new UserManager(cognitoAuthConfig);

export default function Login() {
  useEffect(() => {
    userManager.signinRedirect().catch((error) => {
      console.error("Error al redirigir al Hosted UI:", error);
    });
  }, []);

  return <p>Redirigiendo a la página de autenticación...</p>;
}

