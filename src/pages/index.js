// pages/dashboard/index.js
import Layout from '../components/Layout';
// pages/index.js
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export default function Home({ user }) {
  return (
    <div>
      <h1>Bienvenido {user ? user.email : 'Invitado'}</h1>
      {/* El resto de tu contenido */}
    </div>
  );
}

export async function getServerSideProps(context) {
  const cookies = cookie.parse(context.req.headers.cookie || "");
  const { idToken } = cookies;
  if (!idToken) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  // Configura jwksClient para validar el token
  const client = jwksClient({
    jwksUri: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json"
  });

  function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
      if (err) return callback(err);
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  try {
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(idToken, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });

    if (!decodedToken.email) {
      return { redirect: { destination: "/login", permanent: false } };
    }

    return { props: { user: decodedToken } };
  } catch (error) {
    console.error("Error al verificar token en index:", error);
    return { redirect: { destination: "/login", permanent: false } };
  }
}
