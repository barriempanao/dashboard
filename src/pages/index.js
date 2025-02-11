import { useSession, signIn, signOut } from "next-auth/react";

// Ejemplo de uso en un componente:
export default function HomeComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Cargando sesión...</p>;

  return (
    <div>
      {!session ? (
        <button onClick={() => signIn("cognito")}>Iniciar sesión</button>
      ) : (
        <>
          <p>Bienvenido, {session.user.email}</p>
          <button onClick={() => signOut()}>Cerrar sesión</button>
        </>
      )}
    </div>
  );
}
