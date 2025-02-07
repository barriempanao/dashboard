import React from "react";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await Auth.signOut();
      sessionStorage.removeItem("user");
      router.push("https://auth.total-remote-control.com/logout"); // URL de logout en Cognito
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
