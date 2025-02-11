// components/Layout.js

import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-100 text-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}


/*
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <Header />
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

const layoutStyle = {
  display: 'flex',
};

const mainContentStyle = {
  flex: 1,
};

const contentStyle = {
  padding: '20px',
};
*/
