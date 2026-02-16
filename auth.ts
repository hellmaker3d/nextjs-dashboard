import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import * as bcrypt from 'bcryptjs';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Función para obtener usuario de la DB
async function getUser(email: string): Promise<User | undefined> {
    try {
        const users = await sql<User[]>`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}`;
        return users[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return undefined;
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    pages: {
        signIn: '/login',
    },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) return null;

                // Validación con Zod
                const parsed = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                const user = await getUser(email);
                if (!user) {
                    console.log('User not found:', email);
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) {
                    console.log('Incorrect password for:', email);
                    return null;
                }

                // Retornamos solo los datos necesarios para la sesión
                return { id: user.id, email: user.email };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (token) session.user.id = token.id as string;
            return session;
        },
    },
});
