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
        // 🔍 Verificar el token usando Cognito JWKS (sin clave secreta)
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

// ✅ Agregar un componente React como exportación por defecto
export default function Account({ user }) {
    return (
        <div>
            <h1>Cuenta</h1>
            {user ? (
                <p>Email: {user.email}</p>
            ) : (
                <p>No se encontraron datos del usuario.</p>
            )}
        </div>
    );
}
