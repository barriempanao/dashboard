import { serialize } from 'cookie';

export default async function handler(req, res) {
    if (!req.query.code) {
        return res.status(400).json({ error: 'Missing code' });
    }

    try {
        const response = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.COGNITO_CLIENT_ID,
                redirect_uri: process.env.COGNITO_REDIRECT_URI,
                code: req.query.code,
            }),
        });

        const data = await response.json();

        if (!data.id_token) {
            return res.status(400).json({ error: 'No token received' });
        }

        // 🔹 Guarda el token en una cookie segura
        res.setHeader('Set-Cookie', serialize('authToken', data.id_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 días
        }));

        res.redirect(302, '/dashboard');
    } catch (error) {
        console.error('Auth callback error:', error);
        return res.status(500).json({ error: 'Error processing authentication' });
    }
}
