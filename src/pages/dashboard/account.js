import { useState } from 'react';
import Layout from '../../components/Layout';

export async function getServerSideProps({ req }) {
  // Verifica que exista el token en req.cookies
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

    // Reconstruye la cabecera "cookie" a partir de req.cookies
    const cookieHeader = Object.entries(req.cookies || {})
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    // Llama a la API interna pasando la cabecera "cookie" reconstruida
    const res = await fetch(`${baseUrl}/api/user?email=test`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    const userData = await res.json();
      
      // Si existe la fecha de nacimiento, formatearla a YYYY-MM-DD
          if (userData?.date_of_birth) {
            const dateObj = new Date(userData.date_of_birth);
            const year = dateObj.getFullYear();
            const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
            const day = ("0" + dateObj.getDate()).slice(-2);
            userData.date_of_birth = `${year}-${month}-${day}`;
          }


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
  // Inicializa el estado del formulario con los datos del usuario
  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    tax_identifier: user?.tax_identifier || '',
    country: user?.country || '',
    date_of_birth: user?.date_of_birth || '',
    role: user?.role || '',
    created_at: user?.created_at || '',
  });

  // Actualiza el estado al cambiar un campo
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Envía los cambios a la API (debes implementar el endpoint /api/user/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Nombre"
                />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Apellido"
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Identificación Fiscal</label>
                <input
                  type="text"
                  name="tax_identifier"
                  value={formData.tax_identifier}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>País</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
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
              <div className="form-group">
                <label>Rol</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Creación</label>
                <input
                  type="text"
                  name="created_at"
                  value={formData.created_at}
                  readOnly
                  disabled
                />
              </div>
              <button type="submit" className="submit-btn">
                Guardar Cambios
              </button>
            </form>
          ) : (
            <p>No se encontraron datos del usuario.</p>
          )}
        </Layout>
      );
    }
