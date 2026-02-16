// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1️⃣ Excluir rutas públicas
    const publicRoutes = ['/login', '/signup'];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // 2️⃣ Rutas privadas a proteger
    const protectedRoutes = ['/dashboard', 'dashboard/invoices', 'dashboard/customers', '/invoices/create'];
    if (!protectedRoutes.some(route => pathname.startsWith(route))) {
        // Ruta no es privada, dejar pasar
        return NextResponse.next();
    }

    // 3️⃣ Verificar token de NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        // No está logueado → redirigir al login
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Usuario logueado → permitir acceso
    return NextResponse.next();
}

// 4️⃣ Configurar matcher solo para rutas privadas y evitar assets
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/invoices/:path*',
        '/customers/:path*',
        '/invoices/create/:path*',
    ],
};
