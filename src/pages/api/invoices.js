import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import Stripe from 'stripe';
import { getUserByEmail } from '../../lib/db';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

const COGNITO_JWKS_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u/.well-known/jwks.json';
const client = jwksClient({ jwksUri: COGNITO_JWKS_URL });

function getKey(header, callback) {
  if (!header || !header.kid) {
    return callback(new Error("Missing token header or 'kid'"));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

export default async function handler(req, res) {
    console.log("[API INVOICES] STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
  try {
    // 1. Parsear cookies y token
    const cookies =
      req.cookies && Object.keys(req.cookies).length > 0
        ? req.cookies
        : req.headers.cookie
        ? cookie.parse(req.headers.cookie)
        : {};

    const token = cookies.authToken;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 2. Verificar token Cognito con jwks-rsa
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) return reject(err);
        resolve(decodedToken);
      });
    });

    const email = decoded.email;
    if (!email) {
      return res.status(400).json({ error: 'No email in token' });
    }

    // 3. Obtener datos del usuario
      console.log("[API INVOICES] Email decodificado del token:", email);
      const user = await getUserByEmail(email);
      console.log("[API INVOICES] Usuario desde DB:", user);
    if (!user || !user.stripe_customer_id) {
      return res.status(404).json({ error: 'User not found or no Stripe ID' });
    }

    const customerId = user.stripe_customer_id;

    // 4. GET: listar facturas
    if (req.method === 'GET') {
      const { page = 1 } = req.query;
      const limit = 24;

        console.log("[API INVOICES] Stripe customer ID:", customerId);
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: parseInt(limit, 10),
      });

      const result = invoices.data.map(inv => ({
        id: inv.id,
        number: inv.number,
        created: inv.created,
        pdfUrl: inv.invoice_pdf,
        canBeRecreated:
          !inv.customer_name ||
          !inv.customer_address?.line1 ||
          !inv.customer_tax_ids?.length,
      }));

      return res.status(200).json({
        items: result,
        hasMore: invoices.has_more,
      });
    }

    // 5. POST: regenerar factura
    else if (req.method === 'POST') {
      const { invoiceId } = req.body;
      if (!invoiceId) return res.status(400).json({ message: 'Missing invoiceId' });

      const invoice = await stripe.invoices.retrieve(invoiceId);
      const now = Math.floor(Date.now() / 1000);
      const ninetyDaysAgo = now - 90 * 86400;

      if (invoice.created < ninetyDaysAgo) {
        return res.status(400).json({ message: 'Invoice too old to regenerate' });
      }

      // Verificar que el usuario tiene datos fiscales completos
      const hasFiscalData =
        user.first_name && user.last_name &&
        user.address && user.country && user.tax_identifier;

      if (!hasFiscalData) {
        return res.status(400).json({ message: 'Missing fiscal data' });
      }

      // Emitir nota de crédito
      await stripe.creditNotes.create({ invoice: invoiceId });

      // Actualizar datos fiscales en Stripe
      await stripe.customers.update(customerId, {
        name: `${user.first_name} ${user.last_name}`,
        address: {
          line1: user.address,
          country: user.country,
        },
        tax_id_data: [{
          type: user.country.toLowerCase() === 'es' ? 'es_nif' : 'eu_vat',
          value: user.tax_identifier,
        }],
      });

      // Emitir nueva factura con los mismos productos (Stripe la generará automáticamente si hay subs activa)
      const newInvoice = await stripe.invoices.create({
        customer: customerId,
        description: `Corrected invoice for ${invoice.number}`,
        auto_advance: true,
      });

      return res.status(200).json({ newInvoiceUrl: newInvoice.hosted_invoice_url });
    }

    // 6. Método no permitido
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error("[API INVOICES] Error:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
