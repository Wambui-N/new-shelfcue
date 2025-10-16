"use client";

import { motion } from "framer-motion";
import {
	BarChart3,
	Calendar,
	CheckCircle,
	Clock,
	Crown,
	FileText,
	Loader2,
	Shield,
	Users,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BillingSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";

type Plan = {
	id: string;
	name: string;
	display_name: string;
	description: string;
	price_monthly: number;
	price_yearly: number;
	features: string[];
	limits: Record<string, any>;
};

type Subscription = {
	id: string;
	plan_id: string;
	status: string;
	billing_cycle: string;
	trial_start: string;
	trial_end: string;
	current_period_end: string;
	cancel_at_period_end: boolean;
	plan: Plan;
};

export default function BillingPage() {
	const [loading, setLoading] = useState(true);
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [plan, setPlan] = useState<Plan | null>(null);
	const [usage, setUsage] = useState<any>(null);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
	const [isTrialOnboarding, setIsTrialOnboarding] = useState(false);

	useEffect(() => {
		// Check if this is trial onboarding from query params
		const params = new URLSearchParams(window.location.search);
		setIsTrialOnboarding(params.get('trial') === 'true');
		
		fetchData();
	}, []);

	async function fetchData() {
		try {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setLoading(false);
				return;
			}

			// Fetch current subscription
			const subResponse = await fetch("/api/subscriptions/current", {
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (subResponse.ok) {
				const subData = await subResponse.json();
				setSubscription(subData.subscription);
				setUsage(subData.usage);

				// Calculate trial days remaining
				if (subData.subscription?.status === 'trial' && subData.subscription?.trial_end) {
					const trialEnd = new Date(subData.subscription.trial_end);
					const now = new Date();
					const days = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
					setTrialDaysRemaining(Math.max(0, days));
				}
			}

			// Fetch professional plan
			const plansResponse = await fetch("/api/subscriptions/plans");
			if (plansResponse.ok) {
				const plansData = await plansResponse.json();
				const professionalPlan = plansData.plans.find((p: Plan) => p.name === 'professional');
				setPlan(professionalPlan);
			}
		} catch (error) {
			console.error("Error fetching billing data:", error);
		} finally {
			setLoading(false);
		}
	}

	async function handleSubscribe() {
		try {
			setPaymentLoading(true);
			
			// Get user session
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.user?.email) {
				alert("Please sign in to subscribe");
				return;
			}

			// Determine if this is a trial signup
			const isTrial = !subscription; // If no subscription exists, it's a trial signup
			
			// Initialize payment using official Paystack flow
			const response = await fetch("/api/payments/initialize", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({ 
					email: session.user.email,
					amount: 2900, // $29.00 in cents
					is_trial: isTrial // Pass trial flag
				}),
			});

			console.log("Payment initialization response status:", response.status);
			
			if (!response.ok) {
				const errorData = await response.json();
				console.error("Payment initialization error:", errorData);
				throw new Error(errorData.error || "Failed to initialize payment");
			}

			const data = await response.json();
			console.log("Payment initialization success:", data);

			// Redirect to Paystack payment page
			window.location.href = data.authorization_url;
			
		} catch (error) {
			console.error("Error initiating payment:", error);
			alert("Failed to initiate payment. Please try again.");
		} finally {
			setPaymentLoading(false);
		}
	}

	if (loading) {
		return <BillingSkeleton />;
	}

	const isOnTrial = subscription?.status === 'trial';
	const isActive = subscription?.status === 'active';
	const isExpired = subscription?.status === 'expired' || (isOnTrial && trialDaysRemaining === 0);

	return (
		<div className="space-y-8 max-w-6xl">
			{/* Trial Onboarding Banner */}
			{isTrialOnboarding && !subscription && (
				<Card className="p-6 shadow-lg border-2 border-primary bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
							<Zap className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-foreground mb-2">
								Welcome to ShelfCue! 🎉
							</h2>
							<p className="text-muted-foreground mb-4">
								You're one step away from starting your <span className="font-semibold text-foreground">14-day free trial</span>. Add your payment details below to unlock unlimited forms and submissions.
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-primary" />
									<span>No charge today</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-primary" />
									<span>Cancel anytime</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-primary" />
									<span>Full feature access</span>
								</div>
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
				<p className="text-muted-foreground mt-1">
					{isTrialOnboarding && !subscription 
						? "Add payment details to start your free trial"
						: "Manage your subscription and billing information"
					}
				</p>
			</div>

			{/* Trial Status Banner */}
			{isOnTrial && trialDaysRemaining > 0 && (
				<Card className="p-6 shadow-sm border-2 border-primary bg-gradient-to-r from-primary/10 to-accent/10">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
							<Clock className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-foreground">
								Free Trial Active
							</h3>
							<p className="text-muted-foreground">
								You have <span className="font-bold text-primary">{trialDaysRemaining} days</span> remaining in your trial. Subscribe now to continue using all features.
							</p>
						</div>
						<Button
							onClick={() => handleSubscribe()}
							disabled={paymentLoading}
							className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
						>
							{paymentLoading ? (
								<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
							) : (
								<><Zap className="w-4 h-4 mr-2" />Subscribe Now</>
							)}
						</Button>
					</div>
				</Card>
			)}

			{/* Expired Status Banner */}
			{isExpired && (
				<Card className="p-6 shadow-sm border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
							<Clock className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-foreground">
								Trial Expired
							</h3>
							<p className="text-muted-foreground">
								Your trial has ended. Subscribe now to regain access to all features.
							</p>
						</div>
						<Button
							onClick={() => handleSubscribe()}
							disabled={paymentLoading}
							className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
						>
							{paymentLoading ? (
								<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
							) : (
								<><Zap className="w-4 h-4 mr-2" />Subscribe Now</>
							)}
						</Button>
					</div>
				</Card>
			)}

			{/* Current Status */}
			<Card className="p-6 shadow-sm border-primary">
				<div className="flex items-start justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
							<Crown className="w-6 h-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-foreground">
								Current Status
							</h2>
							<p className="text-sm text-muted-foreground">
								{isOnTrial ? "14-Day Free Trial" : isActive ? "Professional Plan" : "Subscription Required"}
							</p>
						</div>
					</div>
					<Badge className={isActive ? "bg-green-600" : isOnTrial ? "bg-primary" : "bg-red-600"}>
						{isActive ? "Active" : isOnTrial ? "Trial" : "Expired"}
					</Badge>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<div className="p-4 bg-background-secondary rounded-xl">
						<FileText className="w-5 h-5 text-primary mb-2" />
						<div className="text-2xl font-bold text-foreground">
							{usage?.forms_count || 0}
						</div>
						<div className="text-xs text-muted-foreground">Forms (Unlimited)</div>
					</div>
					<div className="p-4 bg-background-secondary rounded-xl">
						<Users className="w-5 h-5 text-green-600 mb-2" />
						<div className="text-2xl font-bold text-foreground">
							{usage?.submissions_count || 0}
						</div>
						<div className="text-xs text-muted-foreground">Leads This Month (Unlimited)</div>
					</div>
					<div className="p-4 bg-background-secondary rounded-xl">
						<BarChart3 className="w-5 h-5 text-purple-600 mb-2" />
						<div className="text-2xl font-bold text-foreground">Advanced</div>
						<div className="text-xs text-muted-foreground">Analytics</div>
					</div>
					<div className="p-4 bg-background-secondary rounded-xl">
						<Shield className="w-5 h-5 text-orange-600 mb-2" />
						<div className="text-2xl font-bold text-foreground">Priority</div>
						<div className="text-xs text-muted-foreground">Support</div>
					</div>
				</div>

				{isActive && subscription?.current_period_end && (
					<div className="text-sm text-muted-foreground">
						Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
					</div>
				)}
			</Card>

			{/* Subscription Plan */}
			{plan && (
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-6">
						{isActive ? "Your Plan" : "Subscribe to ShelfCue Professional"}
					</h2>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<Card className="p-8 border-2 border-primary shadow-sm">
							<div className="flex justify-end mb-4">
								{!subscription && (
									<Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
										<Zap className="w-3 h-3 mr-1" />
										14-Day Free Trial
									</Badge>
								)}
							</div>

							<div className="text-center mb-6">
								<h3 className="text-2xl font-bold text-foreground mb-2">
									{plan.display_name}
								</h3>
								<div className="mb-4">
									{!subscription ? (
										<>
											<span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
												$0.50
											</span>
											<span className="text-muted-foreground ml-2">authorization</span>
											<p className="text-sm text-muted-foreground mt-2">
												Then ${plan.price_monthly}/month after 14 days
											</p>
										</>
									) : (
										<>
											<span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
												${plan.price_monthly.toLocaleString()}
											</span>
											<span className="text-muted-foreground ml-2">/month</span>
										</>
									)}
								</div>
								<p className="text-muted-foreground">{plan.description}</p>
							</div>

							<ul className="space-y-3 mb-6">
								{plan.features.map((feature, index) => (
									<li key={index} className="flex items-start gap-2">
										<CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
										<span className="text-sm text-muted-foreground">{feature}</span>
									</li>
								))}
							</ul>

							{!isActive && (
								<div>
									<Button
										className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
										disabled={paymentLoading}
										onClick={() => handleSubscribe()}
									>
										{paymentLoading ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Processing...
											</>
										) : (
											<>
												<Zap className="w-4 h-4 mr-2" />
												{isOnTrial && trialDaysRemaining > 0 ? "Subscribe Now" : "Start 14-Day Free Trial"}
											</>
										)}
									</Button>
									{!subscription && (
										<p className="text-xs text-center text-muted-foreground mt-3">
											We'll charge $0.50 to authorize your card. You'll only be charged ${plan.price_monthly}/month after your trial ends.
										</p>
									)}
								</div>
							)}

						{isActive && (subscription as any)?.paystack_email_token && (
							<div className="mt-6 p-4 bg-muted rounded-lg">
								<p className="text-sm text-muted-foreground mb-3">
									Manage your subscription and payment method:
								</p>
								<Button variant="outline" asChild className="w-full">
									<a
										href={`https://paystack.com/subscription/manage/${(subscription as any).paystack_email_token}`}
										target="_blank"
										rel="noopener noreferrer"
									>
											Manage Subscription
										</a>
									</Button>
								</div>
							)}
						</Card>
					</motion.div>
				</div>
			)}
		</div>
	);
}
