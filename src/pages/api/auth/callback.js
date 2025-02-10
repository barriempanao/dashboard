// pages/api/auth/callback.js
import { UserManager } from "oidc-client-ts";
import cookie from "cookie";

// Configuración de Cognito (usa los datos que necesitas)
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u",
  client_id: "4fbadbb2qqj15u0vf5dmauudbj",
  // Asegúrate de que el redirect_uri apunte a este endpoint:
  redirect_uri: "https://dashboard.total-remote-control.com/api/auth/callback",
  response_type: "code",
  scope: "email openid profile",
};

const userManager = new UserManager(cognitoAuthConfig);

export default async function handler(req, res) {
  try {
    // Nota: oidc-client-ts está pensado para el cliente. En SSR puede presentar desafíos,
    // pero para simplificar usaremos este método. Si fuera necesario, en un entorno real se podría
    // utilizar una librería como "openid-client" en el servidor.
    const currentUser = await userManager.signinRedirectCallback(req.url);
    // Extraemos el id_token (puedes extraer otros tokens si lo deseas)
    const idToken = currentUser.id_token;
    // Establecemos una cookie httpOnly para almacenar el token
    res.setHeader("Set-Cookie", cookie.serialize("idToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hora (ajusta según convenga)
      path: "/",
      sameSite: "strict"
    }));
    // Redirige al usuario a la página principal (o a la que desees)
    res.writeHead(302, { Location: "/" });
    res.end();
  } catch (error) {
    console.error("Error en el callback de auth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
}
