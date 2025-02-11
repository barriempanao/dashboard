// components/Header.js
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm p-4 flex items-center">
      <Link href="https://total-remote-control.com">
        <Image
          src="/logo.png"
          alt="Total Remote Control"
          width={100}
          height={100}
          className="h-16 w-auto cursor-pointer"
        />
      </Link>
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
