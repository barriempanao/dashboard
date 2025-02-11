// src/pages/index.js

import dynamic from 'next/dynamic';

// Importa el componente HomeComponent con SSR deshabilitado
const HomeComponent = dynamic(() => import('../components/HomeComponent'), { ssr: false });

export default function HomePage() {
  return <HomeComponent />;
}
