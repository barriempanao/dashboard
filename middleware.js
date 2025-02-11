import { NextResponse } from "next/server";

const cleanUrl = (url) => url.replace(/\/+$/, ""); // Elimina barras finales

export function middleware(req) {
  const token = req.cookies.get("authToken");

  if (!token) {
    console.log("Middleware detecta usuario no autenticado, redirigiendo...");
    const cognitoLogin = `${cleanUrl(process.env.NEXT_PUBLIC_COGNITO_DOMAIN)}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(cleanUrl(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI))}`;
    return NextResponse.redirect(cognitoLogin);
  }

  return NextResponse.next();
}
