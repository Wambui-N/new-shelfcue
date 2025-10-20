import { type NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Send welcome email to newly registered users
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Get user profile
    const { data: profile, error } = await (supabase as any)
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (error || !profile?.email) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Send welcome email
    const result = await EmailService.sendWelcomeEmail(
      profile.email,
      profile.full_name || "there",
    );

    if (result.success) {
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
