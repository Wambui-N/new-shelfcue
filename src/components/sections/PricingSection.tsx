"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

export function PricingSection() {
  const priceMonthly = 8;

  const pricing = {
    headline: "One Simple Plan, Everything You Need",
    subhead: "No tiers. No surprises. Just one price and everything included.",
    benefits: [
      "Unlimited forms for all your clients",
      "Unlimited bookings and submissions",
      "Clients book calls without back-and-forth",
      "Submissions organized automatically in Google Sheets",
      "Professional, customizable forms for every client",
      "All future updates and improvements included",
    ],
    ctaHeadline: "Ready to streamline your client intake?",
    ctaSubtext: "Join other professionals using ShelfCue to save time.",
    ctaText: "Start your 14-day free trial",
    trialLine: "No credit card required",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="pricing"
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        className="container mx-auto max-w-5xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Header Section */}
        <motion.div
          className="text-center mb-8 sm:mb-10"
          variants={itemVariants}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            {pricing.headline}
          </h2>
          <p className="text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto">
            {pricing.subhead}
          </p>
        </motion.div>

        {/* Main Pricing Card */}
        <motion.div
          className="rounded-2xl border border-light-gray/30 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10"
          variants={itemVariants}
        >
          {/* Price Section */}
          <div className="mb-8">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-6xl sm:text-7xl font-bold text-foreground">
                ${priceMonthly}
              </span>
              <span className="text-2xl text-foreground-muted">/month</span>
            </div>
            <p className="text-lg text-foreground-muted mb-2">
              One plan. Unlimited everything.
            </p>
            <p className="text-sm text-foreground-muted/70">
              No setup fees. No hidden costs. Cancel anytime.
            </p>
          </div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8"
            variants={containerVariants}
          >
            {pricing.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors duration-300"
                variants={itemVariants}
              >
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-base text-foreground-muted">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="border-t border-light-gray/30 pt-6"
            variants={itemVariants}
          >
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">14</p>
                <p className="text-xs sm:text-sm text-foreground-muted mt-1">Day free trial</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">0</p>
                <p className="text-xs sm:text-sm text-foreground-muted mt-1">Credit card needed</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">∞</p>
                <p className="text-xs sm:text-sm text-foreground-muted mt-1">Cancel anytime</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="rounded-2xl bg-black p-6 sm:p-8 lg:p-10 text-center"
          variants={itemVariants}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {pricing.ctaHeadline}
          </h3>
          <p className="text-base sm:text-lg text-white/70 mb-6 max-w-2xl mx-auto">
            {pricing.ctaSubtext}
          </p>
          <Link href="/auth/signup" className="inline-block">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-semibold px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg group transition-all duration-300"
              onClick={() => {
                posthog.capture("pricing_cta_clicked", {
                  price_monthly: priceMonthly,
                  cta_text: pricing.ctaText,
                  location: "pricing_section",
                });
              }}
            >
              {pricing.ctaText}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-white/50 mt-3">{pricing.trialLine}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
