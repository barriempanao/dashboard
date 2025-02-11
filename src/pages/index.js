// src/pages/index.js

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Bienvenido a la Aplicación</h1>
      {status === "loading" && <p>Cargando sesión...</p>}
      {!session && status !== "loading" && (
        <>
          <p>No estás autenticado.</p>
          {/* Al hacer clic, se invoca el proveedor "cognito" */}
          <button onClick={() => signIn("cognito")}>Iniciar sesión</button>
        </>
      )}
      {session && (
        <>
          <p>Autenticado como: {session.user.email}</p>
          <button onClick={() => signOut()}>Cerrar sesión</button>
        </>
      )}
    </div>
  );
}
