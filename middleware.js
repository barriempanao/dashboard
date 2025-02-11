import { NextResponse } from 'next/server';

export async function middleware(req) {
  const url = req.nextUrl;
  const session = req.cookies.get('session') || null;

  if (!session && !url.pathname.startsWith('/api/auth')) {
    // Redirigir al login de Cognito si no hay sesión
    const cognitoLogin = `${process.env.COGNITO_DOMAIN}/login?client_id=${process.env.COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${process.env.COGNITO_REDIRECT_URI}`;
    return NextResponse.redirect(cognitoLogin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*', // Aplica el middleware a todas las rutas
};
