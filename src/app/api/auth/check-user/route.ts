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
		const adminApi = (supabaseAdmin.auth.admin ?? {}) as {
			getUserByEmail?: (
				email: string,
			) => Promise<{ data: { user: unknown } | null; error: unknown }>;
			listUsers?: (
				params?: { page?: number; perPage?: number },
			) => Promise<{ data: { users: Array<{ email?: string }> } | null }>;
		};

		let exists = false;
		let lastError: unknown;

		if (typeof adminApi.getUserByEmail === "function") {
			const { data, error } = await adminApi.getUserByEmail(
				email.trim().toLowerCase(),
			);
			if (error && (error as { message?: string }).message !== "User not found") {
				lastError = error;
			} else {
				exists = !!data?.user;
			}
		} else if (typeof adminApi.listUsers === "function") {
			const list = await adminApi.listUsers();
			exists = !!list?.data?.users?.some(
				(user) =>
					user.email?.toLowerCase() === email.trim().toLowerCase(),
			);
		} else {
			lastError = new Error("Supabase admin API does not expose user listing");
		}

		if (lastError) {
			console.error("Error checking user existence:", lastError);
			return NextResponse.json(
				{ error: "Failed to check user" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ exists });
	} catch (error) {
		console.error("Unexpected error checking user:", error);
		return NextResponse.json(
			{ error: "Failed to check user" },
			{ status: 500 },
		);
	}
}


