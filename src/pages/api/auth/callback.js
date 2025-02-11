export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No authorization code provided" });
  }

  try {
    const response = await fetch("https://us-east-1b0tpHM55u.auth.us-east-1.amazoncognito.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.COGNITO_CLIENT_ID,
        redirect_uri: process.env.COGNITO_REDIRECT_URI,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: "Error fetching tokens", details: data });
    }

    // Guardar en la sesión del cliente (localStorage) mediante una redirección con el token
    res.setHeader("Set-Cookie", `access_token=${data.access_token}; Path=/; Secure; HttpOnly; SameSite=Strict`);
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during authentication callback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
