import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  pages: {
    signIn: "/auth",
    error: "/auth", // Redirect all errors to your custom auth page
  },
  providers: [
    CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Missing credentials");
      }

      await connectDB();

      const user = await User.findOne({ email: credentials.email });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.isVerified) {
        throw new Error("Email not verified");
      }

      const isValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isValid) {
        throw new Error("Invalid password");
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      };
    },
  }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });

        if (account?.provider === "google") {
          if (!existingUser) {
            // If user does not exist, create and mark as verified
            await User.create({
              name: user.name,
              email: user.email,
              isVerified: true, // Google already verifies email
              provider: "google",
            });
            return true;
          } else if (!existingUser.isVerified) {
            // If user exists but is not verified, deny sign in
            return false;
          }
        }
        // For credentials or verified Google users
        return true;
      } catch (error) {
        console.error("Google sign-in error:", error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
