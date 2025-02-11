// src/pages/dashboard/account.js
import { useState } from 'react';
import Layout from '../../components/Layout';
import mysql from 'mysql2/promise'; // Uso de import en lugar de require

export default function Account({ initialUser, error }) {
  const [user, setUser] = useState(initialUser || {});
  const [message, setMessage] = useState(error ? `Error: ${error}` : '');

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        credentials: 'include',
      });
      if (!res.ok) {
        const errResponse = await res.json();
        setMessage(`Error: ${errResponse.error}`);
      } else {
        setMessage('Account updated successfully.');
      }
    } catch {
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <Layout>
      <h1>Account Details</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input type="email" name="email" value={user.email || ''} onChange={handleChange} readOnly />
        
        <label>First Name:</label>
        <input type="text" name="first_name" value={user.first_name || ''} onChange={handleChange} />
        
        <label>Last Name:</label>
        <input type="text" name="last_name" value={user.last_name || ''} onChange={handleChange} />
        
        <label>Phone:</label>
        <input type="text" name="phone" value={user.phone || ''} onChange={handleChange} />
        
        <label>Country:</label>
        <input type="text" name="country" value={user.country || ''} onChange={handleChange} />

        <button type="submit">Update</button>
      </form>
    </Layout>
  );
}

// Obtener datos del primer usuario en la base de datos
export async function getServerSideProps() {
  try {
    const connection = await mysql.createConnection({
      host: 'total-remote-sql-database.ccj4go2eagl0.us-east-1.rds.amazonaws.com',
      user: 'admin',  // Cambia esto por tu usuario de la base de datos
      password: 'Meekeat1073!!', // Cambia esto por tu contraseña de la base de datos
      database: 'total_remote_control',
    });

    const [rows] = await connection.execute('SELECT * FROM users ORDER BY user_id ASC LIMIT 1');
    await connection.end();

    if (rows.length === 0) {
      return { props: { initialUser: null, error: 'No users found' } };
    }

    return { props: { initialUser: rows[0] } };
  } catch (error) {
    return { props: { initialUser: null, error: error.message } };
  }
}
