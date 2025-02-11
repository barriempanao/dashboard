// src/pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export default NextAuth({
  // Configuramos el proveedor de Cognito.
  // Dado que es un cliente público usando PKCE, dejamos clientSecret vacío.
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET, // Cadena vacía
      issuer: process.env.COGNITO_ISSUER,
    }),
  ],
  // Configuramos la sesión para usar JWT (sin base de datos).
  session: {
    strategy: "jwt",
  },
  // Debes definir una secret para firmar y verificar el JWT.
  secret: process.env.NEXTAUTH_SECRET,
  // Callbacks para pasar tokens a la sesión, si lo deseas.
  callbacks: {
    async jwt({ token, account }) {
      // Cuando el usuario inicia sesión, se rellenan los datos de la cuenta.
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Agregamos los tokens a la sesión (opcional).
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      return session;
    },
  },
  // Puedes definir páginas personalizadas si lo deseas:
  // pages: {
  //   signIn: '/auth/signin',
  //   error: '/auth/error'
  // },
});
