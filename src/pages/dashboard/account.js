// src/pages/dashboard/account.js



// src/pages/dashboard/account.js
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
      <div className="p-10">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Account Details</h2>

          {/* Mensaje de estado */}
          {message && <p className={`p-3 mb-4 text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} rounded-lg`}>{message}</p>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium">Email:</label>
              <input type="email" name="email" value={user.email || ''} readOnly className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium">First Name:</label>
                <input type="text" name="first_name" value={user.first_name || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Last Name:</label>
                <input type="text" name="last_name" value={user.last_name || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
              </div>
            </div>

            {/* Teléfono y País */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium">Phone:</label>
                <input type="text" name="phone" value={user.phone || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Country:</label>
                <input type="text" name="country" value={user.country || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
              </div>
            </div>

            {/* Botón de actualización */}
            <div className="text-right">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

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



/*
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
*/
