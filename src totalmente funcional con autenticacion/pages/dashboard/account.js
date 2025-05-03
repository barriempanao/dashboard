// pages/dashboard/account.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import Layout from '../../components/Layout';

export async function getServerSideProps({ req, query }) {
  const token = req.cookies.authToken;
  console.log("DEBUG: authToken from cookies:", token);
  console.log("DEBUG: Query parameter justLoggedIn:", query.justLoggedIn);
  console.log("DEBUG: Query object:", query);
  console.log("Cookies del request:", req.cookies);

  // Si no hay token y NO se tiene el indicador de "justLoggedIn", redirige a Cognito
  if (!token && query.justLoggedIn !== '1') {
    const cognitoLoginUrl = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
    console.log("DEBUG: No token y no justLoggedIn, redirigiendo a Cognito:", cognitoLoginUrl);
    return {
      redirect: { destination: cognitoLoginUrl, permanent: false },
    };
  }
  
  // Si no hay token pero sí tenemos justLoggedIn, retornamos un flag para manejarlo en el cliente
  if (!token && query.justLoggedIn === '1') {
    console.log("DEBUG: No token pero justLoggedIn=1, retornando flag a cliente");
    return {
      props: { user: null, justLoggedIn: true },
    };
  }
  
  // Decodifica el token para obtener información del usuario (por ejemplo, el email)
  let decoded = {};
  try {
    decoded = jwt.decode(token) || {};
    console.log("DEBUG: Token decodificado:", decoded);
  } catch (err) {
    console.error("DEBUG: Error al decodificar el token:", err);
  }
  const email = decoded.email;
  console.log("DEBUG: Email extraído del token:", email);

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const cookieHeader = Object.entries(req.cookies || {})
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    // Usa el email real obtenido del token
    const resFetch = await fetch(`${baseUrl}/api/user?email=${encodeURIComponent(email)}`, {
      headers: { cookie: cookieHeader },
    });
    const userData = await resFetch.json();
    console.log("DEBUG: Datos del usuario obtenidos:", userData);

    if (userData?.date_of_birth) {
      const dateObj = new Date(userData.date_of_birth);
      const year = dateObj.getFullYear();
      const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
      const day = ("0" + dateObj.getDate()).slice(-2);
      userData.date_of_birth = `${year}-${month}-${day}`;
    }

    return {
      props: { user: userData, justLoggedIn: false },
    };
  } catch (error) {
    console.error('DEBUG: Error en getServerSideProps:', error);
    const cognitoLoginUrl = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
    return {
      redirect: { destination: cognitoLoginUrl, permanent: false },
    };
  }
}

export default function Account({ user, justLoggedIn }) {
  const router = useRouter();

  console.log("DEBUG: Prop justLoggedIn en componente:", justLoggedIn);

  // Si se indicó que es justLoggedIn, espera unos instantes y recarga la página
  useEffect(() => {
    if (justLoggedIn) {
      console.log("🔄 [ACCOUNT] Estado justLoggedIn detectado. Esperando 500ms para recargar...");
      setTimeout(() => {
          window.location.reload();
      }, 500);
    }
  }, [justLoggedIn, router]);

  // Inicializa el estado del formulario con los datos del usuario (sin role ni created_at)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    tax_identifier: user?.tax_identifier || '',
    country: user?.country || '',
    date_of_birth: user?.date_of_birth || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Datos actualizados correctamente.');
      } else {
        alert('Error al actualizar los datos.');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar los datos.');
    }
  };

  return (
    <Layout>
      <h1>Cuenta del Usuario</h1>
      {user ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="text" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Nombre" />
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Apellido" />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Identificación Fiscal</label>
            <input type="text" name="tax_identifier" value={formData.tax_identifier} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>País</label>
            <input type="text" name="country" value={formData.country} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
          </div>
          <button type="submit" className="submit-btn">
            Guardar Cambios
          </button>
        </form>
      ) : (
        <p>Cargando datos del usuario...</p>
      )}
    </Layout>
  );
}
