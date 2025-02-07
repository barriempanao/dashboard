// pages/dashboard/index.js
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <Layout>
      <h1>Dashboard</h1>
      <p>Bienvenido a tu área de usuario. Usa el menú de la izquierda para navegar.</p>
      <ul>
        <li><Link href="/dashboard/account">User Account</Link></li>
        <li><Link href="/dashboard/licenses">Licenses</Link></li>
        <li><Link href="/dashboard/devices">Authorized Devices</Link></li>
        <li><Link href="/dashboard/software">Software</Link></li>
      </ul>
    </Layout>
  );
}
