import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const COGNITO_JWKS_URL = `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json`;

// Configuración del cliente JWKS
const client = jwksClient({
    jwksUri: COGNITO_JWKS_URL
});

// Función para obtener la clave de verificación desde JWKS
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

export async function getServerSideProps({ req }) {
    try {
        const token = req.cookies.authToken || null;

        console.log("🟢 getServerSideProps ejecutándose, token:", token);

        // ⚠️ En vez de redirigir, devolvemos un user vacío para depuración
        return {
            props: {
                user: null, // Incluso si no hay datos, forzamos la renderización
            },
        };
    } catch (error) {
        console.error("❌ Error en getServerSideProps:", error);
        return {
            props: {
                user: null,
            },
        };
    }
}

/*
export async function getServerSideProps({ req }) {
    const token = req.cookies.authToken; // Extraer el token de la cookie HttpOnly

    if (!token) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    try {
        // 🔍 Verificar el token usando Cognito JWKS
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
                if (err) reject(err);
                else resolve(decodedToken);
            });
        });

        const email = decoded.email; // Extraer email del token

        if (!email) {
            throw new Error("Email no encontrado en el token");
        }

        // 🔍 Buscar usuario en la base de datos con el email
        const res = await fetch(`${process.env.API_BASE_URL}/api/user?email=${email}`);
        const userData = await res.json();

        console.log("Datos del usuario en account.js:", userData);

        return {
            props: {
                user: userData || null,
            },
        };

    } catch (error) {
        console.error("Error al verificar el token:", error);
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
}
 */

// ✅ Componente de cuenta del usuario
export default function Account({ user }) {
    console.log("Renderizando Account.js con user:", user);

    return (
        <div>
            <h1>Cuenta del Usuario</h1>
            {user ? (
                <div>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Nombre:</strong> {user.first_name || "No disponible"} {user.last_name || ""}</p>
                    <p><strong>Teléfono:</strong> {user.phone || "No disponible"}</p>
                    <p><strong>Dirección:</strong> {user.address || "No disponible"}</p>
                    <p><strong>Identificación Fiscal:</strong> {user.tax_identifier || "No disponible"}</p>
                    <p><strong>País:</strong> {user.country || "No disponible"}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {user.date_of_birth || "No disponible"}</p>
                    <p><strong>Rol:</strong> {user.role || "No disponible"}</p>
                    <p><strong>Fecha de Creación:</strong> {user.created_at || "No disponible"}</p>
                </div>
            ) : (
                <p>No se encontraron datos del usuario.</p>
            )}
        </div>
    );
}
