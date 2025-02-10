// con fetch Iker
import cookie from 'cookie';

// Función auxiliar para hacer un POST con x-www-form-urlencoded
async function postTokenEndpoint(tokenEndpoint, body) {
  // 'body' es un objeto con { grant_type, code, client_id, redirect_uri, ... }
  // convertimos a URLSearchParams
  const params = new URLSearchParams(body);

  const resp = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!resp.ok) {
    // Si el server respondió con 4xx o 5xx, lanzamos error
    const errText = await resp.text();
    throw new Error(`Token endpoint error: ${resp.status} - ${errText}`);
  }

  return resp.json();
}


export default async function handler(req, res) {
  try {
    console.log("Hola from finalCallback, no openid-client at all!");
    res.end("Ok!");
  } catch(e) {
    console.error(e);
    res.status(500).end();
  }
}
