import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export default NextAuth({
  providers: [
    CognitoProvider({
      clientId: "4fbadbb2qqj15u0vf5dmauudbj",
      issuer: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_b0tpHM55u",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
});
