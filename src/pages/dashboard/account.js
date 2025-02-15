import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import Layout from '../../components/Layout';

export async function getServerSideProps({ req }) {
  const token = req.cookies.authToken;
  if (!token) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }

  try {
    // (Aquí puedes verificar el token o asumir que la API lo verificará)
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Envía las cookies en la cabecera para que la API pueda parsearlas
    const res = await fetch(`${baseUrl}/api/user?email=test`, { // El email en la query no es necesario ya que lo usará el token
      headers: {
        cookie: req.headers.cookie || '',
      },
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
  return (
    <Layout>
      <div>
        <h1>Cuenta del Usuario</h1>
        {user ? (
          <div>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Nombre:</strong> {user.first_name || 'No disponible'} {user.last_name || ''}</p>
            <p><strong>Teléfono:</strong> {user.phone || 'No disponible'}</p>
            <p><strong>Dirección:</strong> {user.address || 'No disponible'}</p>
            <p><strong>Identificación Fiscal:</strong> {user.tax_identifier || 'No disponible'}</p>
            <p><strong>País:</strong> {user.country || 'No disponible'}</p>
            <p><strong>Fecha de Nacimiento:</strong> {user.date_of_birth || 'No disponible'}</p>
            <p><strong>Rol:</strong> {user.role || 'No disponible'}</p>
            <p><strong>Fecha de Creación:</strong> {user.created_at || 'No disponible'}</p>
          </div>
        ) : (
          <p>No se encontraron datos del usuario.</p>
        )}
      </div>
    </Layout>
  );
}
