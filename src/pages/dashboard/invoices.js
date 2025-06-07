// src/pages/dashboard/invoices.js
import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import Layout from '../../components/Layout';
import axios from 'axios';

export async function getServerSideProps({ req }) {
  const token = req.cookies.authToken;
  if (!token) {
    const cognitoLoginUrl = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/login?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI)}`;
    return {
      redirect: { destination: cognitoLoginUrl, permanent: false },
    };
  }

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

  return {
    props: { userEmail: email },
  };
}

export default function Invoices({ userEmail }) {
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const invoicesPerPage = 24;

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/invoices?page=${page}`);
        setInvoices(res.data);
      } catch (err) {
        setError('Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [page]);

  const handleRecreate = async (invoiceId) => {
    try {
      const res = await axios.post('/api/invoices/recreate', { invoiceId });
      window.open(res.data.newInvoiceUrl, '_blank');
    } catch (err) {
      alert(err.response?.data?.message || 'Error recreating invoice');
    }
  };

  return (
    <Layout>
      <div className="layout">
        <div className="main-content">
          <div className="content">
            <h1>Invoices</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && (
              <>
                <div className="invoice-list">
                                    <table className="invoice-table">
                                      <thead>
                                        <tr>
                                          <th>PDF</th>
                                          <th>Number</th>
                                          <th>Date</th>
                                          <th></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {invoices.items.map(inv => (
                                          <tr key={inv.id}>
                                            <td>
                                              <a href={inv.pdfUrl} target="_blank" rel="noreferrer">
                                                <img
                                                  src="/invoice-icon.svg"
                                                  alt="Invoice PDF"
                                                  className="invoice-icon"
                                                  width={24}
                                                  height={24}
                                                />
                                              </a>
                                            </td>
                                            <td>{inv.number}</td>
                                            <td>{new Date(inv.created * 1000).toLocaleDateString()}</td>
                                            <td>
                                              {inv.canBeRecreated && (
                                                <button onClick={() => handleRecreate(inv.id)} className="btn btn-sm">
                                                  Regenerate with tax data
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                </div>
                <div className="pagination">
                  {page > 1 && <button onClick={() => setPage(page - 1)}>Previous</button>}
                  {invoices.hasMore && <button onClick={() => setPage(page + 1)}>Next</button>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
