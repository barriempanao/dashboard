// pages/dashboard/licenses.js
import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import Layout from '../../components/Layout';

export async function getServerSideProps({ req }) {
  // Extraemos el token de las cookies
  const token = req.cookies.authToken;
  if (!token) {
    const cognitoLoginUrl = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
    return {
      redirect: { destination: cognitoLoginUrl, permanent: false },
    };
  }

  // Decodificamos el token para obtener el email del usuario
  let decoded = {};
  try {
    decoded = jwt.decode(token) || {};
  } catch (err) {
    console.error("Error al decodificar el token:", err);
  }
  const email = decoded.email;
  if (!email) {
    // Si no se pudo extraer el email, redirigimos a login
    const cognitoLoginUrl = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
    return {
      redirect: { destination: cognitoLoginUrl, permanent: false },
    };
  }

  // Construimos la URL base para llamar a la API interna
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  // Creamos un header de cookies para pasar la autenticación a la API interna
  const cookieHeader = Object.entries(req.cookies || {})
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  // Llamamos al endpoint que nos devuelve las licencias del usuario
  const resFetch = await fetch(
    `${baseUrl}/api/licenses?email=${encodeURIComponent(email)}`,
    { headers: { cookie: cookieHeader } }
  );
  const licenses = await resFetch.json();

  return {
    props: { licenses, userEmail: email },
  };
}

export default function Licenses({ licenses, userEmail }) {
  // Estado para la licencia seleccionada
  const [selectedLicense, setSelectedLicense] = useState(null);

  // Si hay licencias y aún no hay ninguna seleccionada, seleccionamos la primera por defecto
  useEffect(() => {
    if (licenses && licenses.length > 0 && !selectedLicense) {
      setSelectedLicense(licenses[0]);
    }
  }, [licenses, selectedLicense]);

  return (
    <Layout>
      <h1>Licenses</h1>
      <div
        style={{
          display: 'flex',
          height: '80vh',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* Lista de licencias (barra lateral izquierda) */}
        <div
          style={{
            flex: '1',
            overflowY: 'auto',
            borderRight: '1px solid #ccc',
            padding: '1rem',
          }}
        >
          {licenses && licenses.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {licenses.map((license) => (
                <li
                  key={license.license_id}
                  style={{
                    padding: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedLicense &&
                      selectedLicense.license_id === license.license_id
                        ? '#eee'
                        : 'transparent',
                    borderBottom: '1px solid #ddd',
                  }}
                  onClick={() => setSelectedLicense(license)}
                >
                  {license.license_key}
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron licencias para {userEmail}.</p>
          )}
        </div>

        {/* Detalles de la licencia seleccionada (área derecha) */}
        <div style={{ flex: '2', padding: '1rem' }}>
          {selectedLicense ? (
            <div>
              <h2>Detalles de la Licencia</h2>
              <p>
                <strong>ID:</strong> {selectedLicense.license_id}
              </p>
              <p>
                <strong>License Key:</strong> {selectedLicense.license_key}
              </p>
              <p>
                <strong>Issued At:</strong>{' '}
                {new Date(selectedLicense.issued_at).toLocaleString()}
              </p>
              <p>
                <strong>Last Validated At:</strong>{' '}
                {selectedLicense.last_validated_at
                  ? new Date(selectedLicense.last_validated_at).toLocaleString()
                  : 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {selectedLicense.status}
              </p>
              {/* Puedes agregar más detalles según la estructura de la tabla */}
            </div>
          ) : (
            <p>Seleccione una licencia para ver sus detalles.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
