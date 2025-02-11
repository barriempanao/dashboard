export default async function handler(req, res) {
    try {
        const { code } = req.query;

        if (!code) {
            console.error("⚠️ No se recibió código de autenticación.");
            return res.status(400).json({ error: "No authorization code provided" });
        }

        console.log("🔹 Código de autenticación recibido:", code);

        // Verificamos que las variables de entorno están cargadas
        if (!process.env.COGNITO_DOMAIN || !process.env.COGNITO_CLIENT_ID || !process.env.COGNITO_REDIRECT_URI) {
            console.error("❌ ERROR: Variables de entorno faltantes:");
            console.error("COGNITO_DOMAIN:", process.env.COGNITO_DOMAIN);
            console.error("COGNITO_CLIENT_ID:", process.env.COGNITO_CLIENT_ID);
            console.error("COGNITO_REDIRECT_URI:", process.env.COGNITO_REDIRECT_URI);
            return res.status(500).json({ error: "Server configuration error. Missing env variables." });
        }

        const tokenEndpoint = `${process.env.COGNITO_DOMAIN}/oauth2/token`;

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.COGNITO_CLIENT_ID,
            redirect_uri: process.env.COGNITO_REDIRECT_URI,
            code
        });

        console.log("🔹 Enviando solicitud a:", tokenEndpoint);
        console.log("🔹 Parámetros enviados:", body.toString());

        const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("⚠️ Error al obtener el token:", errorText);
            return res.status(response.status).json({ error: "Error fetching tokens", details: errorText });
        }

        const tokenData = await response.json();
        console.log("✅ Tokens recibidos:", tokenData);

        // Guardamos el token en una cookie segura
        res.setHeader("Set-Cookie", `authToken=${tokenData.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`);

        return res.redirect(302, "/dashboard");

    } catch (error) {
        console.error("⚠️ Error inesperado en callback:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
