// components/Sidebar.js
export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col p-5 space-y-6 h-screen">
      {/* Logo */}
      <div className="flex justify-center">
        <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
      </div>

      {/* Menú de navegación */}
      <nav className="flex flex-col space-y-2">
        <a href="/dashboard/account" className="px-4 py-3 rounded-md hover:bg-gray-700 transition">User Account</a>
        <a href="/dashboard/licenses" className="px-4 py-3 rounded-md hover:bg-gray-700 transition">Licenses</a>
        <a href="/dashboard/devices" className="px-4 py-3 rounded-md hover:bg-gray-700 transition">Authorized Devices</a>
        <a href="/dashboard/software" className="px-4 py-3 rounded-md hover:bg-gray-700 transition">Software</a>
      </nav>
    </aside>
  );
}




/*
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside style={sidebarStyle}>
      <nav>
        <ul style={navListStyle}>
          <li style={navItemStyle}>
            <Link href="/dashboard/account">User Account</Link>
          </li>
          <li style={navItemStyle}>
            <Link href="/dashboard/licenses">Licenses</Link>
          </li>
          <li style={navItemStyle}>
            <Link href="/dashboard/devices">Authorized Devices</Link>
          </li>
          <li style={navItemStyle}>
            <Link href="/dashboard/software">Software</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

const sidebarStyle = {
  width: '220px',
  backgroundColor: '#2c3e50',
  color: '#ecf0f1',
  minHeight: '100vh',
  padding: '20px'
};

const navListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0
};

const navItemStyle = {
  marginBottom: '15px'
};
*/
