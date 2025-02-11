export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          code,
          redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
        }),
      }
    );

    const data = await response.json();
    if (!data.id_token) {
      return res.status(400).json({ error: "Failed to get ID token" });
    }

    res.setHeader(
      "Set-Cookie",
      `session=${data.id_token}; Path=/; HttpOnly; Secure`
    );
    res.redirect("/");
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
