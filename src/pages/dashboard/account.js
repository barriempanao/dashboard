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
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Account Details</h2>

          {/* Mensaje de estado */}
          {message && <p className={`p-3 mb-4 text-sm text-center ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} rounded-lg`}>{message}</p>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">Email:</label>
              <input type="email" name="email" value={user.email || ''} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed shadow-sm" />
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-medium mb-1">First Name:</label>
                <input type="text" name="first_name" value={user.first_name || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Last Name:</label>
                <input type="text" name="last_name" value={user.last_name || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 shadow-sm" />
              </div>
            </div>

            {/* Teléfono y País */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Phone:</label>
                <input type="text" name="phone" value={user.phone || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Country:</label>
                <input type="text" name="country" value={user.country || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 shadow-sm" />
              </div>
            </div>

            {/* Botón de actualización */}
            <div className="flex justify-center">
              <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-300">
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
