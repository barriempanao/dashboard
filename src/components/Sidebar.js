// components/Sidebar.js

import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰ Menu
      </button>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav>
          <ul>
            <li><Link href="/dashboard/account">User Account</Link></li>
            <li><Link href="/dashboard/licenses">Licenses</Link></li>
            <li><Link href="/dashboard/devices">Authorized Devices</Link></li>
            <li><Link href="/dashboard/software">Software</Link></li>
          </ul>
        </nav>
      </aside>
    </>
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
