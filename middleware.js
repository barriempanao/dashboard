export function middleware(req, event) {
  const { cookies } = req;

  if (!cookies.get("access_token")) {
    return Response.redirect("https://auth.total-remote-control.com/login/continue?client_id=4fbadbb2qqj15u0vf5dmauudbj&response_type=code&scope=email+openid+profile&redirect_uri=https%3A%2F%2Fdashboard.total-remote-control.com%2Fapi%2Fauth%2Fcallback");
  }

  return Response.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Aplica este middleware a todas las rutas del dashboard
};
