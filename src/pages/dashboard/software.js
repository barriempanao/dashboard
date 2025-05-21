import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaApple, FaWindows } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import Image from "next/image";
import Layout from "../../components/Layout";

// Spinner CSS
const spinnerStyle = {
  margin: "2rem auto",
  border: "6px solid #f3f3f3",
  borderTop: "6px solid #3498db",
  borderRadius: "50%",
  width: "48px",
  height: "48px",
  animation: "spin 1s linear infinite",
};

// Animación CSS global
const spinnerKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const InstallerIcon = ({ platform }) => {
  switch (platform.toLowerCase()) {
    case "macos":
      return <FaApple size={24} style={{ marginRight: 8 }} />;
    case "windows":
      return <FaWindows size={24} style={{ marginRight: 8 }} />;
    default:
      return null;
  }
};

const SoftwarePage = () => {
  const [installers, setInstallers] = useState([]);
  const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInstallers = async () => {
          try {
            const res = await axios.get("https://hwsojrc2nl.execute-api.us-east-1.amazonaws.com/prod/installers", {
              withCredentials: true,
            });
            setInstallers(res.data.installers || []);
          } catch (err) {
            console.error("Error fetching installers:", err);
            setError("Failed to load installers.");
          } finally {
            setLoading(false);
          }
        };
        fetchInstallers();
      }, []);

    return (
        <Layout>
          <style>{spinnerKeyframes}</style>

          <div className="installer-list" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Available Installers</h2>

            {loading ? (
              <div style={{ textAlign: "center" }}>
                <div style={spinnerStyle}></div>
                <p>Generating download links... Please wait.</p>
              </div>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              installers.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1rem",
                    background: "#f9f9f9",
                    marginBottom: "1rem",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <InstallerIcon platform={item.platform} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold" }}>{item.platform}</div>
                    <div style={{ color: "#666" }}>v{item.version}</div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#0070f3",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      textDecoration: "none",
                    }}
                  >
                    <MdDownload size={20} style={{ marginRight: 6 }} />
                    Download
                  </a>
                </div>
              ))
            )}

            {!loading && (
              <div
                style={{
                  borderTop: "1px solid #ddd",
                  paddingTop: "2rem",
                  textAlign: "center",
                  marginTop: "2rem",
                }}
              >
                <a
                  href="https://apps.apple.com/app/total-remote-control/id6745529093"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/apple-store-badge.svg"
                    alt="Download on the App Store"
                    width={160}
                    height={54}
                  />
                </a>
                <p style={{ marginTop: "0.5rem", color: "#555" }}>
                  Available for all iOS devices on the Apple Store
                </p>
              </div>
            )}
          </div>
        </Layout>
      );
    };

    export default SoftwarePage;
    
    
    /*
  return (
    <Layout>
      <div className="installer-list" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Available Installers</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {installers.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "1rem",
              background: "#f9f9f9",
              marginBottom: "1rem",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <InstallerIcon platform={item.platform} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold" }}>{item.platform}</div>
              <div style={{ color: "#666" }}>v{item.version}</div>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#0070f3",
                color: "#fff",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <MdDownload size={20} style={{ marginRight: 6 }} />
              Download
            </a>
          </div>
        ))}

        <div
          style={{
            borderTop: "1px solid #ddd",
            paddingTop: "2rem",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          <a
            href="https://apps.apple.com/app/total-remote-control/id6745529093"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/apple-store-badge.svg"
              alt="Download on the App Store"
              width={160}
              height={54}
            />
          </a>
          <p style={{ marginTop: "0.5rem", color: "#555" }}>
            Available for all iOS devices on the Apple Store
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SoftwarePage;
     */
