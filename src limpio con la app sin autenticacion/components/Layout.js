// components/Layout.js
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
