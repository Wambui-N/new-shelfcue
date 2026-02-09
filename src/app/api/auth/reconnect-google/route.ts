import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { generateGoogleOAuthUrl } from "@/lib/google-oauth-url";

/**
 * API endpoint to initiate Google reconnection
 * This forces a fresh OAuth flow to get new API tokens for Sheets/Calendar
 */
export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: (() => cookieStore) as unknown as () => ReturnType<typeof cookies>,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 Initiating Google reconnection for user:", user.id);

    // Generate OAuth URL using utility function
    const authUrl = generateGoogleOAuthUrl(user.id, "reconnect");

    console.log("✅ Generated reconnection URL for user:", user.id);

    return NextResponse.json({
      url: authUrl,
    });
  } catch (error: any) {
    console.error("❌ Error generating reconnection URL:", error);
    return NextResponse.json(
      { error: "Failed to generate reconnection URL", details: error.message },
      { status: 500 },
    );
  }
}
