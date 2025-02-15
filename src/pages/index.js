// pages/index.js
export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/dashboard/account',
      permanent: false, // Cambia a true si la redirección es permanente
    },
  };
}

export default function Home() {
  return null; // No se renderiza nada porque la redirección se encarga de todo
}
