import { type NextRequest, NextResponse } from "next/server";

/**
 * Backwards-compatible OAuth callback forwarder.
 *
 * Supabase's client-side OAuth uses PKCE and stores the verifier in browser storage.
 * If you try to exchange the code on the server without that verifier, it fails.
 *
 * We keep this endpoint so any previously-configured redirect URLs keep working,
 * but we forward the request to the client callback page where Supabase can
 * complete the exchange.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  return NextResponse.redirect(new URL(`/auth/callback${url.search}`, origin));
}
