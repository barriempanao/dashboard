// src/pages/dashboard.js

import { getSession } from "next-auth/react";

export default function Dashboard({ session }) {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {session.user.email}</p>
      <p>Aquí se muestra contenido protegido.</p>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // Si no hay sesión, redirigimos al login.
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin?callbackUrl=/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
