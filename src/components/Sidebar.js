import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout');
      if (response.ok) {
        // Redirige a la página de inicio o de login
        window.location.href = '/';
      } else {
        console.error('Error en logout');
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
  };

  return (
    <>
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰ Menu
      </button>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav>
          <ul>
            <li>
              <Link href="/dashboard/account" onClick={() => setIsOpen(false)}>
                User Account
              </Link>
            </li>
            <li>
              <Link href="/dashboard/licenses" onClick={() => setIsOpen(false)}>
                Licenses
              </Link>
            </li>
            <li>
              <Link href="/dashboard/devices" onClick={() => setIsOpen(false)}>
                Authorized Devices
              </Link>
            </li>
            <li>
              <Link href="/dashboard/software" onClick={() => setIsOpen(false)}>
                Software
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="logout-btn"
                style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer' }}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}





/*
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
            <li><Link href="/dashboard/account" onClick={() => setIsOpen(false)}>User Account</Link></li>
            <li><Link href="/dashboard/licenses" onClick={() => setIsOpen(false)}>Licenses</Link></li>
            <li><Link href="/dashboard/devices" onClick={() => setIsOpen(false)}>Authorized Devices</Link></li>
            <li><Link href="/dashboard/software" onClick={() => setIsOpen(false)}>Software</Link></li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
*/
