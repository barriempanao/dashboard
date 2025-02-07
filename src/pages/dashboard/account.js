import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function Account() {
  // Estado para almacenar los datos del usuario, incluyendo los nuevos campos.
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    country: '',
    tax_identifier: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Al montar la página, se obtiene la información del usuario desde el endpoint.
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user', {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Se envían cookies o tokens de autenticación (Cognito)
        });
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        setMessage('Error loading user details');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Manejar el envío del formulario para actualizar la cuenta
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/user', {
        method: 'PUT', // O PATCH, según tu implementación en el endpoint
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        credentials: 'include'
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(`Error: ${err.error}`);
      } else {
        setMessage('Account updated successfully.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error updating account.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>User Account</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={formGroupStyle}>
          <label htmlFor="first_name">First Name:</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={user.first_name}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="last_name">Last Name:</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={user.last_name}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            disabled  // Por lo general, el email no se edita
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={user.address}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="country">Country:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={user.country}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="tax_identifier">Tax Identifier:</label>
          <input
            type="text"
            id="tax_identifier"
            name="tax_identifier"
            value={user.tax_identifier}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="phone">Phone:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={user.phone}
            onChange={handleChange}
          />
        </div>
        <button type="submit" style={buttonStyle}>Update Account</button>
      </form>
    </Layout>
  );
}

const formStyle = {
  maxWidth: '600px',
  marginTop: '20px'
};

const formGroupStyle = {
  marginBottom: '15px',
  display: 'flex',
  flexDirection: 'column'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#2c3e50',
  color: '#fff',
  border: 'none',
  cursor: 'pointer'
};
