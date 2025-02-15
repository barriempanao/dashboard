export default function handler(req, res) {
    console.log("🔍 [CHECK] Headers recibidos:", req.headers);
    console.log("🔍 [CHECK] Cookies recibidas:", req.headers.cookie);
    
    const authToken = req.cookies.authToken;
    console.log("🔍 [CHECK] authToken extraído:", authToken);

    if (authToken) {
        return res.json({ authenticated: true });
    }
    return res.json({ authenticated: false });
}
