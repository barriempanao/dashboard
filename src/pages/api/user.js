// pages/api/user.js
import mysql from 'mysql2/promise';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Configuración de MySQL usando variables de entorno
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

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


async function verifyToken(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const authToken = cookies.authToken;

  console.log("🔍 [VERIFY] Token recibido:", authToken);

  if (!authToken) {
    console.error("❌ [VERIFY] No se encontró token en la cookie.");
    throw new Error("No token found");
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(authToken, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) {
          console.error("❌ [VERIFY] Error en JWT:", err);
          return reject(err);
        }
        resolve(decoded);
      });
    });

    console.log("✅ [VERIFY] Token decodificado:", decoded);

    if (!decoded.email) {
      console.warn("⚠️ [VERIFY] No se encontró el email en el token. Usando 'cognito:username'");
    }

    return decoded;
  } catch (error) {
    console.error("❌ [VERIFY] Error general en verifyToken:", error);
    throw new Error("Invalid token");
  }
}


export default async function handler(req, res) {
  try {
    console.log("🔍 [USER] Headers recibidos:", req.headers);
    console.log("🔍 [USER] Cookies recibidas:", req.headers.cookie);

    const cookies = cookie.parse(req.headers.cookie || "");
    const authToken = cookies.authToken;
    console.log("🔍 [USER] authToken extraído:", authToken);

    const decodedToken = await verifyToken(req);

    const email = decodedToken.email || decodedToken["cognito:username"];
    console.log("🔍 [USER] Email extraído del token:", email);

    if (!email) {
      console.error("❌ [USER] No se encontró el email en el token decodificado.");
      return res.status(401).json({ error: 'Unauthorized - No email found in token' });
    }

    if (req.method === 'GET') {
      return getUser(req, res, email);
    } else if (req.method === 'PUT') {
      return updateUser(req, res, email);
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("❌ [USER] Error en verifyToken:", error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

async function getUser(req, res, email) {
  try {
    console.log("🔍 [DB] Buscando usuario en la base de datos con email:", email);
    
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT first_name, last_name, email, address, country, tax_identifier, phone FROM users WHERE email = ?',
      [email]
    );
    connection.end();

    if (rows.length === 0) {
      console.warn("⚠️ [DB] Usuario no encontrado en la base de datos.");
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("✅ [DB] Usuario encontrado:", rows[0]);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("❌ [DB] Error en la consulta SQL:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function updateUser(req, res, email) {
  try {
    console.log("🔍 [DB] Actualizando datos del usuario:", email);
    console.log("🔍 [DB] Datos a actualizar:", req.body);

    const { first_name, last_name, address, country, tax_identifier, phone } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE users SET first_name = ?, last_name = ?, address = ?, country = ?, tax_identifier = ?, phone = ? WHERE email = ?',
      [first_name, last_name, address, country, tax_identifier, phone, email]
    );
    connection.end();

    if (result.affectedRows === 0) {
      console.warn("⚠️ [DB] No se actualizó ningún usuario. Puede que el email no exista en la base de datos.");
      return res.status(404).json({ error: 'User not found or no changes made' });
    }

    console.log("✅ [DB] Usuario actualizado correctamente.");
    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error("❌ [DB] Error en la actualización de datos:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/*
async function verifyToken(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const authToken = cookies.authToken;  // ✅ Corregido a `authToken`
    console.log("🔍 [VERIFY] Token recibido en verifyToken:", authToken);
  
  if (!authToken) {
    throw new Error("No token found");
  }

  return new Promise((resolve, reject) => {
    jwt.verify(authToken, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        console.error("JWT Verification Error:", err);
        return reject(new Error("Invalid token"));
      }
      resolve(decoded);
    });
  });
}


export default async function handler(req, res) {
  try {
      console.log("🔍 [USER] Headers recibidos:", req.headers);
          console.log("🔍 [USER] Cookies recibidas:", req.headers.cookie);
          
      const cookies = cookie.parse(req.headers.cookie || "");
      const authToken = cookies.authToken;
      console.log("🔍 [USER] authToken extraído:", authToken);
      
      
      
    const decodedToken = await verifyToken(req);
      const email = decodedToken.email || decodedToken["cognito:username"];
      if (!email) {
        console.error("JWT missing email:", decodedToken);
        return res.status(401).json({ error: 'Unauthorized - No email found in token' });
      }

    if (req.method === 'GET') {
      return getUser(req, res, email);
    } else if (req.method === 'PUT') {
      return updateUser(req, res, email);
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error en verifyToken:", error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}



async function getUser(req, res, email) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT first_name, last_name, email, address, country, tax_identifier, phone FROM users WHERE email = ?',
      [email]
    );
    connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
 
 

async function updateUser(req, res, email) {
  try {
    const { first_name, last_name, address, country, tax_identifier, phone } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE users SET first_name = ?, last_name = ?, address = ?, country = ?, tax_identifier = ?, phone = ? WHERE email = ?',
      [first_name, last_name, address, country, tax_identifier, phone, email]
    );
    connection.end();

    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
*/
