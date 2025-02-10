import { UserManager } from "oidc-client-ts";

// Configuración del cliente OIDC
const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u",
    client_id: "4fbadbb2qqj15u0vf5dmauudbj",
    redirect_uri: "https://dashboard.total-remote-control.com/",
    response_type: "code",
    scope: "email openid profile",
};

// Crear una instancia de UserManager
export const userManager = new UserManager(cognitoAuthConfig);

// Función para manejar el cierre de sesión
export async function signOutRedirect() {
    const clientId = "4fbadbb2qqj15u0vf5dmauudbj";
    const logoutUri = "https://dashboard.total-remote-control.com/";
    const cognitoDomain = "https://auth.total-remote-control.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
