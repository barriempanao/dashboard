export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" });
  }

  const cleanUrl = (url) => url.replace(/\/+$/, ""); // Elimina barras finales

  const tokenUrl = `${cleanUrl(process.env.NEXT_PUBLIC_COGNITO_DOMAIN)}/oauth2/token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      code,
      redirect_uri: cleanUrl(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(400).json({ error: "Failed to retrieve token", details: data });
  }

  // Guardamos el token en una cookie HTTP-Only para validaciones
  res.setHeader("Set-Cookie", `authToken=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`);

  // Redirigir al dashboard después de guardar el token
  res.redirect(302, process.env.NEXT_PUBLIC_NEXTAUTH_URL || "/dashboard");
}
