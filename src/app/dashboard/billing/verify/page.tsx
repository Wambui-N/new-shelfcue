"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";

function VerifyContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const reference = searchParams.get("reference");

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (reference) {
			verifyPayment(reference);
		} else {
			setStatus("error");
			setMessage("No payment reference found");
		}
	}, [reference]);

	async function verifyPayment(ref: string) {
		try {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setStatus("error");
				setMessage("Please sign in to verify payment");
				return;
			}

			const response = await fetch(`/api/payments/verify?reference=${ref}`, {
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			const data = await response.json();

			if (response.ok && data.success) {
				setStatus("success");
				setMessage("Payment verified successfully! Your subscription is now active.");
			} else {
				setStatus("error");
				setMessage(data.error || "Payment verification failed");
			}
		} catch (error) {
			setStatus("error");
			setMessage("An error occurred while verifying payment");
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="max-w-md w-full p-8 text-center">
				{status === "loading" && (
					<>
						<Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Verifying Payment
						</h2>
						<p className="text-muted-foreground">
							Please wait while we verify your payment...
						</p>
					</>
				)}

				{status === "success" && (
					<>
						<div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
						</div>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Payment Successful!
						</h2>
						<p className="text-muted-foreground mb-6">{message}</p>
						<Button
							onClick={() => router.push("/dashboard/billing")}
							className="w-full"
						>
							Go to Billing
						</Button>
					</>
				)}

				{status === "error" && (
					<>
						<div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
							<XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
						</div>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Payment Failed
						</h2>
						<p className="text-muted-foreground mb-6">{message}</p>
						<div className="flex gap-3">
							<Button
								onClick={() => router.push("/dashboard/billing")}
								variant="outline"
								className="flex-1"
							>
								Back to Billing
							</Button>
							<Button
								onClick={() => router.push("/dashboard")}
								className="flex-1"
							>
								Go to Dashboard
							</Button>
						</div>
					</>
				)}
			</Card>
		</div>
	);
}

export default function VerifyPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<Loader2 className="w-8 h-8 animate-spin text-primary" />
				</div>
			}
		>
			<VerifyContent />
		</Suspense>
	);
}

