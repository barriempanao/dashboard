import { useSession, signIn } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    signIn(); // Redirige automáticamente al login
    return <p>Redirigiendo...</p>;
  }

  return <div>Bienvenido al Dashboard, {session.user.email}</div>;
}
