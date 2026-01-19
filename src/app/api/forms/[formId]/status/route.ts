import { type NextRequest, NextResponse } from "next/server";
import { canPerformAction } from "@/lib/subscriptionLimits";
import { createServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;
    const { status } = await request.json();

    if (!status || !["draft", "published"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'draft' or 'published'" },
        { status: 400 },
      );
    }

    // If trying to publish, check subscription
    if (status === "published") {
      const limitCheck = await canPerformAction(
        user.id,
        "submissions_per_month",
      );
      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: "Subscription required",
            message:
              limitCheck.message ||
              "Your trial has expired. Please subscribe to publish forms and receive submissions.",
          },
          { status: 403 },
        );
      }
    }

    // Verify form ownership
    const supabaseAdmin = getSupabaseAdmin();
    const { data: form, error: formError } = await (supabaseAdmin as any)
      .from("forms")
      .select("id, user_id")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update form status
    const { error: updateError } = await (supabaseAdmin as any)
      .from("forms")
      .update({ status })
      .eq("id", formId);

    if (updateError) {
      console.error("Error updating form status:", updateError);
      return NextResponse.json(
        { error: "Failed to update form status" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error in PUT /api/forms/[formId]/status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
