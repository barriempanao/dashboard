export default function handler(req, res) {
    const authToken = req.cookies.authToken;

    if (authToken) {
        return res.json({ authenticated: true });
    }

    return res.json({ authenticated: false });
}
