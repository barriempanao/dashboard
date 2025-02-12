import { useState } from 'react';
import Layout from '../../components/Layout';
import mysql from 'mysql2/promise';

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
        setMessage(`❌ Error: ${errResponse.error}`);
      } else {
        setMessage('✅ Account updated successfully.');
      }
    } catch {
      setMessage('⚠️ An unexpected error occurred.');
    }
  };

  return (
    <Layout>
      <div className="main-content">
        <div className="form-container">
          <h2>Account Details</h2>

          {/* Mensaje de estado */}
          {message && <p className="message">{message}</p>}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" value={user.email || ''} readOnly />
            </div>

            {/* Nombre y Apellido */}
            <div className="form-grid">
              <div className="form-group">
                <label>First Name:</label>
                <input type="text" name="first_name" value={user.first_name || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input type="text" name="last_name" value={user.last_name || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Teléfono y País */}
            <div className="form-grid">
              <div className="form-group">
                <label>Phone:</label>
                <input type="text" name="phone" value={user.phone || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Country:</label>
                <input type="text" name="country" value={user.country || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Botón de actualización */}
            <button type="submit" className="submit-btn">Update</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}


// 🔹 Obtener los datos del usuario autenticado desde la base de datos
export async function getServerSideProps(context) {
  try {
    const { req } = context;
    const token = req.cookies['auth-token']; // 🔹 Extraer token del usuario autenticado

    if (!token) {
      return { props: { initialUser: null, error: 'Not authenticated' } };
    }

    // 🔹 Consultar el usuario autenticado en la base de datos
    const connection = await mysql.createConnection({
      host: 'total-remote-sql-database.ccj4go2eagl0.us-east-1.rds.amazonaws.com',
      user: 'admin',
      password: 'Meekeat1073!!',
      database: 'total_remote_control',
    });

    const [rows] = await connection.execute('SELECT * FROM users WHERE auth_token = ?', [token]);
    await connection.end();

    if (rows.length === 0) {
      return { props: { initialUser: null, error: 'User not found' } };
    }

    return { props: { initialUser: rows[0] } };
  } catch (error) {
    return { props: { initialUser: null, error: error.message } };
  }
}


/*
// 🔹 OBTENER DATOS DEL PRIMER USUARIO EN LA BASE DE DATOS 🔹
export async function getServerSideProps() {
  try {
    const connection = await mysql.createConnection({
      host: 'total-remote-sql-database.ccj4go2eagl0.us-east-1.rds.amazonaws.com',
      user: 'admin',
      password: 'Meekeat1073!!',
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
*/
