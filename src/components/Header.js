// components/Header.js

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Total Remote Control</h1>
      <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
    </header>
  );
}

/*
import Link from 'next/link';
import Image from 'next/image'; // Importar next/image

export default function Header() {
  return (
    <header style={headerStyle}>
      <Link href="https://total-remote-control.com">
        <Image
          src="/logo.png"
          alt="Total Remote Control"
          width={200}
          height={50}
          style={logoStyle}
        />
      </Link>
    </header>
  );
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #ddd'
};

const logoStyle = {
  cursor: 'pointer'
};
*/
