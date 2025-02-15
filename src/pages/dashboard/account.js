// pages/dashboard/account.js
import { useState } from 'react';
import Layout from '../../components/Layout';

export async function getServerSideProps({ req }) {
  // Intenta obtener el token a partir de la cabecera de cookies
  const cookieHeader = req.headers.cookie || "";
  // Si usas cookie.parse aquí, asegúrate de que funcione; en este ejemplo, verificamos directamente:
  const token = cookieHeader.includes("authToken=")
    ? cookieHeader.split("authToken=")[1].split(";")[0]
    : null;

  if (!token) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Usa directamente la cabecera de cookies que viene en req.headers
    const res = await fetch(`${baseUrl}/api/user`, {
      headers: { cookie: cookieHeader },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      return { props: { user: null } };
    }

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
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    tax_identifier: user?.tax_identifier || '',
    country: user?.country || '',
    date_of_birth: user?.date_of_birth ? user.date_of_birth.split('T')[0] : '',
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
        const errorText = await res.text();
        console.error('Error al actualizar:', errorText);
        setMessage('Error al actualizar la información.');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      setMessage('Error al actualizar la información.');
    }
  };

  // Si no se pudieron obtener los datos del usuario, se muestra un mensaje.
  if (!user) {
    return (
      <Layout>
        <div className="account-container">
          <h1>Error al cargar la información de tu cuenta.</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="account-container">
        <h1>Mi Cuenta</h1>
        <div className="user-details">
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <h2>Editar Información</h2>
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
          <button type="submit" className="submit-btn">
            Actualizar Información
          </button>
        </form>
        {message && <p className="update-message">{message}</p>}
      </div>
    </Layout>
  );
}
