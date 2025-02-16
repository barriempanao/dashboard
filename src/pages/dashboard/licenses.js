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

  // Decodificamos el token para obtener el email
  let decoded = {};
  try {
    decoded = jwt.decode(token) || {};
  } catch (err) {
    console.error("Error al decodificar el token:", err);
  }
  const email = decoded.email;
  if (!email) {
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

// Función auxiliar para determinar el tipo de licencia según el license_key
function getLicenseType(licenseKey) {
  if (licenseKey.startsWith("MON")) {
    return "Monthly";
  } else if (licenseKey.startsWith("ANN")) {
    return "Annual";
  } else if (licenseKey.startsWith("PER")) {
    return "Perpetual";
  } else {
    return "Unknown";
  }
}

export default function Licenses({ licenses, userEmail }) {
  const [selectedLicense, setSelectedLicense] = useState(null);

  // Si hay licencias y aún no hay ninguna seleccionada, seleccionamos la primera por defecto
  useEffect(() => {
    if (licenses && licenses.length > 0 && !selectedLicense) {
      setSelectedLicense(licenses[0]);
    }
  }, [licenses, selectedLicense]);

  return (
    <Layout>
      <div className="layout">
        {/* Sidebar con la lista de licencias */}
        <div className="sidebar">
          <h2>Licenses</h2>
          {licenses && licenses.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {licenses.map((license) => {
                const isSelected =
                  selectedLicense && selectedLicense.license_id === license.license_id;
                return (
                  <li
                    key={license.license_id}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eee' : 'transparent',
                      borderBottom: '1px solid #ddd',
                      color: isSelected ? '#333' : '#ecf0f1',
                    }}
                    onClick={() => setSelectedLicense(license)}
                  >
                    {license.license_key}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No se encontraron licencias para {userEmail}.</p>
          )}
        </div>

        {/* Área principal con los detalles de la licencia seleccionada */}
        <div className="main-content">
          <div className="content">
            {selectedLicense ? (
              <div>
                <h2>Detalles de la Licencia</h2>
                <p>
                  <strong>Type:</strong> {getLicenseType(selectedLicense.license_key)}
                </p>
                <p>
                  <strong>License Key:</strong> {selectedLicense.license_key}
                </p>
                <p>
                  <strong>Issued At:</strong>{" "}
                  {new Date(selectedLicense.issued_at).toLocaleString()}
                </p>
                <p>
                  <strong>Last Validated At:</strong>{" "}
                  {selectedLicense.last_validated_at
                    ? new Date(selectedLicense.last_validated_at).toLocaleString()
                    : 'N/A'}
                </p>
                <p>
                  <strong>Status:</strong> {selectedLicense.status}
                </p>
                {/* Agrega más detalles según sea necesario */}
              </div>
            ) : (
              <p>Seleccione una licencia para ver sus detalles.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
