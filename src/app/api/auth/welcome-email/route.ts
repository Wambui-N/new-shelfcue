import { type NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend";
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

    // Get user info from auth users
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userData.user;
    const email = user.email;
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "there";

    if (!email) {
      return NextResponse.json({ error: "User has no email" }, { status: 400 });
    }

    // Send welcome email
    const result = await sendWelcomeEmail(email, fullName);

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
