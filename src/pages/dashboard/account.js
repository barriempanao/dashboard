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
      <div className="form-container">
        <h2>Cuenta del Usuario</h2>
        {user ? (
          <form>
            <div className="form-group">
              <label>Email</label>
              <input type="text" value={user.email} readOnly />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={`${user.first_name || 'No disponible'} ${user.last_name || ''}`}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input type="text" value={user.phone || 'No disponible'} readOnly />
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input type="text" value={user.address || 'No disponible'} readOnly />
            </div>
            <div className="form-group">
              <label>Identificación Fiscal</label>
              <input type="text" value={user.tax_identifier || 'No disponible'} readOnly />
            </div>
            <div className="form-group">
              <label>País</label>
              <input type="text" value={user.country || 'No disponible'} readOnly />
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input type="text" value={user.date_of_birth || 'No disponible'} readOnly />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <input type="text" value={user.role || 'No disponible'} readOnly />
            </div>
            <div className="form-group">
              <label>Fecha de Creación</label>
              <input type="text" value={user.created_at || 'No disponible'} readOnly />
            </div>
          </form>
        ) : (
          <p>No se encontraron datos del usuario.</p>
        )}
      </div>
    </Layout>
  );
}
