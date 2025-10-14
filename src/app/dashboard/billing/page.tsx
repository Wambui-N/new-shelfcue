"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  CreditCard,
  Crown,
  Download,
  FileText,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BillingSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function BillingPage() {
  const [currentPlan] = useState("free"); // Mock current plan
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BillingSkeleton />;
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 100 leads/month",
        "3 forms",
        "Google Sheets integration",
        "Email notifications",
        "Basic analytics",
        "Community support",
      ],
      current: currentPlan === "free",
      popular: false,
      color: "from-gray-500 to-gray-600",
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "For growing businesses that need more",
      features: [
        "Up to 10,000 leads/month",
        "Unlimited forms",
        "Google Sheets integration",
        "Advanced analytics",
        "Team collaboration",
        "Priority support",
        "Custom branding",
        "API access",
      ],
      current: currentPlan === "pro",
      popular: true,
      color: "from-primary to-accent",
    },
  ];

  const invoices = [
    {
      id: "INV-001",
      date: "2024-01-01",
      amount: "$29.00",
      status: "paid" as const,
      downloadUrl: "#",
    },
    {
      id: "INV-002",
      date: "2024-02-01",
      amount: "$29.00",
      status: "paid" as const,
      downloadUrl: "#",
    },
    {
      id: "INV-003",
      date: "2024-03-01",
      amount: "$29.00",
      status: "pending" as const,
      downloadUrl: "#",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card className="p-6 shadow-sm border-primary">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Current Plan
              </h2>
              <p className="text-sm text-muted-foreground">
                Your active subscription
              </p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {plans.find((p) => p.current)?.name || "Free"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-background-secondary rounded-xl">
            <FileText className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {currentPlan === "free" ? "3" : "∞"}
            </div>
            <div className="text-xs text-muted-foreground">Forms Limit</div>
          </div>
          <div className="p-4 bg-background-secondary rounded-xl">
            <Users className="w-5 h-5 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {currentPlan === "free" ? "100" : "10,000"}
            </div>
            <div className="text-xs text-muted-foreground">Leads/Month</div>
          </div>
          <div className="p-4 bg-background-secondary rounded-xl">
            <BarChart3 className="w-5 h-5 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {currentPlan === "free" ? "Basic" : "Advanced"}
            </div>
            <div className="text-xs text-muted-foreground">Analytics</div>
          </div>
          <div className="p-4 bg-background-secondary rounded-xl">
            <Shield className="w-5 h-5 text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {currentPlan === "free" ? "Standard" : "Priority"}
            </div>
            <div className="text-xs text-muted-foreground">Support</div>
          </div>
        </div>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Available Plans
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card
                className={`p-8 border-2 ${plan.current ? "border-primary" : "border-border"} shadow-sm`}
              >
                {plan.popular && (
                  <div className="flex justify-end mb-4">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span
                      className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.current
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : plan.popular
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
                        : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                  disabled={plan.current}
                >
                  {plan.current
                    ? "Current Plan"
                    : plan.name === "Free"
                      ? "Downgrade"
                      : "Upgrade"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Billing History
        </h2>
        <Card className="shadow-sm border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">
                        {invoice.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(invoice.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">
                        {invoice.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "secondary"
                        }
                        className={
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : ""
                        }
                      >
                        {invoice.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={invoice.downloadUrl} download>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
