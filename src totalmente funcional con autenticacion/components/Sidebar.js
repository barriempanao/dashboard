import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        // Redirige directamente a la ruta de logout
        window.location.href = '/api/auth/logout';
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
                        <button onClick={handleLogout} className="logout-btn">
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
