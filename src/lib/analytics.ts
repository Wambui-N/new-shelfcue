import { supabaseAdmin } from "./supabase/admin";

export async function trackFormView(formId: string) {
  try {
    await supabaseAdmin.from("form_views").insert({
      form_id: formId,
      viewed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error tracking form view:", error);
  }
}

export async function trackFormViewAuto(formId: string) {
  // This function can be called automatically when forms are viewed
  return trackFormView(formId);
}
