import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/**
 * Barra quem não está logado antes de qualquer página carregar.
 * Só age quando AUTH_SECRET está configurado (no modo de exemplo não há login).
 * As páginas e as ações também conferem o login, então isto é a primeira camada, não a única.
 */
export async function proxy(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
  if (session) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|configurar|_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)"],
};
