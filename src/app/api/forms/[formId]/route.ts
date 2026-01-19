import { type NextRequest, NextResponse } from "next/server";
import { canPerformAction } from "@/lib/subscriptionLimits";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const defaultTheme = {
  primaryColor: "#151419",
  backgroundColor: "#fafafa",
  textColor: "#151419",
  borderRadius: 8,
  fontFamily: "Satoshi",
};

const defaultSettings = {
  showTitle: true,
  showDescription: true,
  submitButtonText: "Submit",
  successMessage: "Thank you for your submission!",
  collectEmail: false,
  allowMultipleSubmissions: true,
  showWatermark: true,
  mode: "standalone",
  layout: "simple",
};

function isSchemaCacheError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message =
    "message" in error && typeof (error as any).message === "string"
      ? (error as any).message
      : "";
  const details =
    "details" in error && typeof (error as any).details === "string"
      ? (error as any).details
      : "";
  return `${message} ${details}`.toLowerCase().includes("schema cache");
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  try {
    const { formId } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // Determine requester (optional). If a bearer token is provided, allow the
    // owner to fetch drafts. Otherwise, only allow published forms.
    const authHeader = request.headers.get("authorization");
    let requesterUserId: string | null = null;

    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7);
      try {
        const {
          data: { user },
        } = await (supabaseAdmin as any).auth.getUser(token);
        requesterUserId = user?.id ?? null;
      } catch (error) {
        console.warn("⚠️ Failed to read requester from bearer token:", error);
      }
    }

    // Fetch form with retry if PostgREST schema cache is temporarily stale
    let data: any = null;
    let error: any = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const result = await (supabaseAdmin as any)
        .from("forms")
        .select("*")
        .eq("id", formId)
        .maybeSingle();

      data = result.data;
      error = result.error;

      if (!error) break;
      if (!isSchemaCacheError(error)) break;

      const delayMs = 800 * attempt;
      console.warn(
        `⚠️ [forms.get] schema cache issue (attempt ${attempt}/4). Retrying in ${delayMs}ms...`,
        { message: error.message, details: error.details, code: error.code },
      );
      await sleep(delayMs);
    }

    if (error || !data) {
      if (isSchemaCacheError(error)) {
        return NextResponse.json(
          {
            error: "Temporary database issue",
            message:
              "The database schema cache is temporarily out of sync. Please try again in a moment.",
            code: "SCHEMA_CACHE_OUT_OF_SYNC",
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Security check: If user is not the owner, only return published forms
    if (requesterUserId !== data.user_id && data.status !== "published") {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown server exception",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;
    const body = await request.json();

    // Defensive defaults to avoid null JSON errors
    const safeTheme = {
      ...defaultTheme,
      ...(body?.theme || {}),
    };
    const safeSettings = {
      ...defaultSettings,
      ...(body?.settings || {}),
    };
    const safeFields = Array.isArray(body?.fields) ? body.fields : [];

    // Check if this is a new form (no existing form with this ID)
    const { data: existingForm } = await supabaseAdmin
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
            message:
              limitCheck.message ||
              "You've reached your form limit. Please upgrade your plan to create more forms.",
          },
          { status: 403 },
        );
      }
    } else {
      // If it's an existing form, verify ownership
      if (existingForm.user_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Update or create the form
    const { data, error } = await supabaseAdmin
      .from("forms")
      .upsert({
        id: formId,
        user_id: user.id,
        title: body.title || "Untitled Form",
        header: body.header || body.title || "Untitled Form", // Use header if provided, else sync with title
        description: body.description || "",
        fields: safeFields,
        settings: safeSettings,
        theme: safeTheme,
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
