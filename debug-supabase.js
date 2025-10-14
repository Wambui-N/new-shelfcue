/**
 * Debug script to check Supabase database state
 * Run with: node debug-supabase.js
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  console.log("Make sure these are set in .env.local:");
  console.log("- NEXT_PUBLIC_SUPABASE_URL");
  console.log("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDatabase() {
  console.log("\n🔍 SUPABASE DEBUG REPORT\n");
  console.log("=".repeat(50));

  // Check if forms table exists
  console.log("\n1. Checking forms table...");
  const { data: forms, error: formsError } = await supabase
    .from("forms")
    .select("id, title, status, user_id, created_at")
    .limit(5);

  if (formsError) {
    console.error("❌ Error querying forms:", formsError);
  } else {
    console.log(`✅ Found ${forms.length} forms:`);
    forms.forEach((form) => {
      console.log(
        `   - ${form.id} | ${form.title} | ${form.status} | User: ${form.user_id.substring(0, 8)}...`,
      );
    });
  }

  // Check specific form that's failing
  const problemFormId = "56f60736-ca82-4072-a977-967430a488ed";
  console.log(`\n2. Checking problem form: ${problemFormId}...`);

  const { data: problemForm, error: problemError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", problemFormId)
    .single();

  if (problemError) {
    console.error("❌ Error:", problemError);
    console.log("   This form does NOT exist in the database!");
  } else {
    console.log("✅ Form found!");
    console.log("   Title:", problemForm.title);
    console.log("   Status:", problemForm.status);
    console.log("   User ID:", problemForm.user_id);
    console.log("   Fields:", problemForm.fields?.length || 0);
    console.log("   Created:", problemForm.created_at);
  }

  // Check table structure
  console.log("\n3. Checking table structure...");
  const { data: sampleForm } = await supabase
    .from("forms")
    .select("*")
    .limit(1)
    .single();

  if (sampleForm) {
    console.log("   Table columns:", Object.keys(sampleForm).join(", "));
  }

  // Check users
  console.log("\n4. Checking auth users...");
  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("❌ Error listing users:", authError);
  } else {
    console.log(`✅ Found ${authUsers.users.length} users`);
    authUsers.users.forEach((user) => {
      console.log(`   - ${user.id.substring(0, 8)}... | ${user.email}`);
    });
  }

  // Check for forms without user_id match
  console.log("\n5. Checking for orphaned forms...");
  const { data: allForms } = await supabase.from("forms").select("id, user_id");

  if (allForms && authUsers) {
    const validUserIds = new Set(authUsers.users.map((u) => u.id));
    const orphaned = allForms.filter((f) => !validUserIds.has(f.user_id));

    if (orphaned.length > 0) {
      console.log(`⚠️  Found ${orphaned.length} forms with invalid user_ids:`);
      orphaned.forEach((f) => {
        console.log(`   - Form ${f.id} | User: ${f.user_id}`);
      });
    } else {
      console.log("✅ No orphaned forms found");
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n✅ Debug complete!\n");
}

debugDatabase().catch(console.error);
