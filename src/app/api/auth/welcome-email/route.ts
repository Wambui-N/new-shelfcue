import { type NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Send welcome email to newly registered users
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile (and whether we already sent welcome email)
    const { data: profile, error } = await (supabase as any)
      .from("profiles")
      .select("email, full_name, welcome_email_sent_at")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Idempotent: already sent
    if ((profile as any)?.welcome_email_sent_at) {
      return NextResponse.json({
        success: true,
        message: "Welcome email already sent",
      });
    }

    const email = (profile as any)?.email;
    if (!email) {
      return NextResponse.json(
        { error: "User has no email" },
        { status: 400 },
      );
    }

    // Send welcome email
    const result = await EmailService.sendWelcomeEmail(
      email,
      (profile as any).full_name || "there",
    );

    if (result.success) {
      await (supabase as any)
        .from("profiles")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("id", userId);
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully",
      });
    }

    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Error in welcome email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
