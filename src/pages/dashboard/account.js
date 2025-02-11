// src/pages/dashboard/account.js
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import cookie from 'cookie';
import { useState } from 'react';
import Layout from '../../components/Layout';

export default function Account({ initialUser, error }) {
  const [user, setUser] = useState(initialUser || {});
  const [message, setMessage] = useState('');

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
        const err = await res.json();
        setMessage(`Error: ${err.error}`);
      } else {
        setMessage('Account updated successfully.');
      }
    } catch {
      // Usamos catch sin variable para evitar que ESLint reclame por variable no usada.
      setMessage('Error updating account.');
    }
  };

  if (error) {
    return (
      <Layout>
        <p>{error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>User Account</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          type="text"
          name="first_name"
          value={user.first_name || ""}
          onChange={handleChange}
        />

        <label>Last Name:</label>
        <input
          type="text"
          name="last_name"
          value={user.last_name || ""}
          onChange={handleChange}
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={user.email || ""}
          disabled
        />

        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={user.address || ""}
          onChange={handleChange}
        />

        <button type="submit">Update Account</button>
      </form>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  try {
    // Parseamos la cookie
    const cookies = cookie.parse(context.req.headers.cookie || "");
    const { idToken } = cookies;
    if (!idToken) {
      // Si no existe el token, redirige a login
      return { redirect: { destination: "/login", permanent: false } };
    }

    // Configurar el cliente para obtener las claves de Cognito
    const client = jwksClient({
      jwksUri: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json"
    });

    function getKey(header, callback) {
      client.getSigningKey(header.kid, function (err, key) {
        if (err) return callback(err);
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      });
    }

    // Verificar el token
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(idToken, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });

    const email = decodedToken.email;
    if (!email) {
      return { redirect: { destination: "/login", permanent: false } };
    }

    // Conectar a MySQL usando las variables de entorno
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      'SELECT first_name, last_name, email, address FROM users WHERE email = ?',
      [email]
    );
    connection.end();

    if (rows.length === 0) {
      return { props: { error: 'User not found' } };
    }

    return { props: { initialUser: rows[0] } };
  } catch (error) {
    console.error("Error en getServerSideProps:", error);
    return { props: { error: 'Internal Server Error' } };
  }
}
