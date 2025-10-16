import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log('🔍 Debug: Checking tokens for user:', userId);
    
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .from("user_google_tokens")
      .select("*")
      .eq("user_id", userId);

    console.log('🔍 Debug: Token query result:', { data, error });

    return NextResponse.json({
      userId,
      hasTokens: !!data && data.length > 0,
      tokenCount: data?.length || 0,
      tokens: data || [],
      error: error?.message || null
    });
  } catch (error: any) {
    console.error("Debug tokens error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
