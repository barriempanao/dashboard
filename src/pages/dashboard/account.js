// pages/dashboard/account.js
import { useState } from 'react';
import Layout from '../../components/Layout';

export async function getServerSideProps({ req }) {
  const token = req.cookies.authToken;
  if (!token) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }
  
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Reconstruye la cabecera cookie a partir de req.cookies
    const cookieHeader = Object.entries(req.cookies || {})
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const res = await fetch(`${baseUrl}/api/user`, {
      headers: { cookie: cookieHeader },
    });
    const userData = await res.json();

    return {
      props: { user: userData || null },
    };
  } catch (error) {
    console.error('Error en getServerSideProps:', error);
    return {
      redirect: { destination: '/', permanent: false },
    };
  }
}

export default function Account({ user }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    address: user.address || '',
    tax_identifier: user.tax_identifier || '',
    country: user.country || '',
    date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage('Información actualizada correctamente.');
      } else {
        setMessage('Error al actualizar la información.');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      setMessage('Error al actualizar la información.');
    }
  };

  return (
    <Layout>
      <div className="account-container">
        <h1>Mi Cuenta</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Tu nombre"
            />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Tu apellido"
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Tu teléfono"
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Tu dirección"
            />
          </div>
          <div className="form-group">
            <label>Identificación Fiscal</label>
            <input
              type="text"
              name="tax_identifier"
              value={formData.tax_identifier}
              onChange={handleChange}
              placeholder="Tu NIF/CIF"
            />
          </div>
          <div className="form-group">
            <label>País</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Tu país"
            />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="submit-btn">Actualizar Información</button>
        </form>
        {message && <p className="update-message">{message}</p>}
      </div>
    </Layout>
  );
}
