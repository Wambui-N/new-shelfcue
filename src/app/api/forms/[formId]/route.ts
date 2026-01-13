import { type NextRequest, NextResponse } from "next/server";
import { canPerformAction } from "@/lib/subscriptionLimits";
import { createServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  try {
    const { formId } = await params;
    const supabase = await createServerClient();
    const supabaseAdmin = getSupabaseAdmin();

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabaseAdmin
      .from("forms")
      .select("*")
      .eq("id", formId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Security check: If user is not the owner, only return published forms
    if (user?.id !== data.user_id && data.status !== "published") {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
    const body = await request.json();

    // Check if this is a new form (no existing form with this ID)
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingForm } = await (supabaseAdmin as any)
      .from("forms")
      .select("id, user_id")
      .eq("id", formId)
      .maybeSingle();

    // If it's a new form, check if user can create forms
    if (!existingForm) {
      const limitCheck = await canPerformAction(user.id, "forms");
      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: "Form limit reached",
            message: limitCheck.message || "You've reached your form limit. Please upgrade your plan to create more forms.",
          },
          { status: 403 },
        );
      }
    } else {
      // If it's an existing form, verify ownership
      if (existingForm.user_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 },
        );
      }
    }

    // Update or create the form
    const { data, error } = await (supabaseAdmin as any)
      .from("forms")
      .upsert({
        id: formId,
        user_id: user.id,
        title: body.title,
        header: body.header || body.title, // Use header if provided, else sync with title
        description: body.description,
        fields: body.fields,
        settings: body.settings,
        theme: body.theme,
        status: body.status || "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving form:", error);
      return NextResponse.json(
        { error: "Failed to save form" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in PUT /api/forms/[formId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
