// pages/dashboard/devices.js
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

export default function Devices({ licenses, userEmail }) {
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [devices, setDevices] = useState([]);

  // Selecciona la primera licencia por defecto
  useEffect(() => {
    if (licenses && licenses.length > 0 && !selectedLicense) {
      setSelectedLicense(licenses[0]);
    }
  }, [licenses, selectedLicense]);

  // Cuando se selecciona una licencia, se obtienen sus dispositivos
  useEffect(() => {
    async function fetchDevices() {
      if (selectedLicense) {
        try {
          const res = await fetch(`/api/devices?license_id=${selectedLicense.license_id}`);
          const data = await res.json();
          setDevices(data);
        } catch (err) {
          console.error("Error fetching devices:", err);
        }
      } else {
        setDevices([]);
      }
    }
    fetchDevices();
  }, [selectedLicense]);

  // Función para remover un dispositivo
  async function handleRemove(machine_id) {
    try {
      const res = await fetch(`/api/devices/${machine_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // Actualizamos la lista local de dispositivos
        setDevices(prev => prev.filter(device => device.machine_id !== machine_id));
      } else {
        console.error("Failed to remove device");
      }
    } catch (err) {
      console.error("Error removing device:", err);
    }
  }

  return (
    <Layout>
      <div className="layout">
        {/* Sidebar: Lista de licencias */}
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

        {/* Panel principal: Dispositivos autorizados para la licencia seleccionada */}
        <div className="main-content">
          <div className="content">
            <h2>Authorized Devices</h2>
            {selectedLicense ? (
              <>
                <h3>Licencia: {selectedLicense.license_key}</h3>
                {devices && devices.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {devices.map((device) => (
                      <li
                        key={device.machine_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem',
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        <span>
                          {device.machine_name} ({device.machine_identifier})
                        </span>
                        <button
                          className="submit-btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '14px',
                            backgroundColor: '#e74c3c',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleRemove(device.machine_id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No se encontraron dispositivos autorizados para esta licencia.</p>
                )}
              </>
            ) : (
              <p>Seleccione una licencia para ver sus dispositivos autorizados.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
