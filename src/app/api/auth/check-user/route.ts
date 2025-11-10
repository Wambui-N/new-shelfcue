import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (typeof email !== "string" || email.trim().length === 0) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 },
			);
		}

		const supabaseAdmin = getSupabaseAdmin();
		const { data, error } = await (supabaseAdmin as any)
			.from("users")
			.select("id")
			.eq("email", email.trim().toLowerCase())
			.maybeSingle();

		if (error) {
			console.error("Error checking user existence:", error);
			return NextResponse.json(
				{ error: "Failed to check user" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			exists: !!data,
		});
	} catch (error) {
		console.error("Unexpected error checking user:", error);
		return NextResponse.json(
			{ error: "Failed to check user" },
			{ status: 500 },
		);
	}
}


