import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// URL del JWKS de Cognito (ajusta según tu configuración)
const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';

// Configuración del cliente JWKS
const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

// Función para obtener la clave de verificación
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    }
  });
}

// Esta función se ejecuta en el servidor antes de renderizar la página
export async function getServerSideProps({ req }) {
  // Extrae el token de la cookie 'authToken'
  const token = req.cookies.authToken;
  if (!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    // Verifica y decodifica el token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) reject(err);
        else resolve(decodedToken);
      });
    });

    const email = decoded.email;
    if (!email) {
      throw new Error('Email no encontrado en el token');
    }

    // Construye la URL absoluta usando el protocolo y host de la request
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Realiza la petición a la API interna usando la URL absoluta
    const res = await fetch(`${baseUrl}/api/user?email=${email}`);
    const userData = await res.json();

    return {
      props: {
        user: userData || null,
      },
    };
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}

// Componente React que muestra la información del usuario
export default function Account({ user }) {
  console.log('Renderizando Account.js con user:', user);
  return (
    <div>
      <h1>Cuenta del Usuario</h1>
      {user ? (
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Nombre:</strong> {user.first_name || 'No disponible'} {user.last_name || ''}
          </p>
          <p>
            <strong>Teléfono:</strong> {user.phone || 'No disponible'}
          </p>
          <p>
            <strong>Dirección:</strong> {user.address || 'No disponible'}
          </p>
          <p>
            <strong>Identificación Fiscal:</strong> {user.tax_identifier || 'No disponible'}
          </p>
          <p>
            <strong>País:</strong> {user.country || 'No disponible'}
          </p>
          <p>
            <strong>Fecha de Nacimiento:</strong> {user.date_of_birth || 'No disponible'}
          </p>
          <p>
            <strong>Rol:</strong> {user.role || 'No disponible'}
          </p>
          <p>
            <strong>Fecha de Creación:</strong> {user.created_at || 'No disponible'}
          </p>
        </div>
      ) : (
        <p>No se encontraron datos del usuario.</p>
      )}
    </div>
  );
}
