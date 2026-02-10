"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import posthog from "posthog-js";

export function PricingSection() {
  const priceMonthly = 17;

  const alternatives = [
    { name: "Zapier", price: 20 },
    { name: "Typeform", price: 39 },
    { name: "Calendly", price: 12 },
  ];
  const totalAlternatives = alternatives.reduce((sum, a) => sum + a.price, 0);
  const savings = totalAlternatives - priceMonthly;

  const pricing = {
    headline: "One Simple Plan, Everything You Need",
    subhead: "No tiers. No surprises. Just one price and everything included.",
    benefits: [
      "Clients book calls without back-and-forth",
      "Submissions organized automatically in Google Sheets",
      "Works quietly in the background",
      "Professional, customizable forms for every client",
      "All future updates and improvements included",
    ],
    simplicityLine:
      "No extra tools. No fragile automations. Just one system that works.",
    ctaText: "Start your 14-day free trial",
    trialLine: "Start your 14-day free trial, no credit card required",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section
      id="pricing"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-background-secondary relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      <motion.div
        className="container mx-auto max-w-4xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Headline */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            {pricing.headline}
          </h2>
          <p className="text-base md:text-lg text-foreground-muted max-w-2xl mx-auto">
            {pricing.subhead}
          </p>
        </motion.div>



        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
            className="relative group"
          >
            <Card className="relative p-6 sm:p-8 border-2 border-primary shadow-xl bg-card/95 backdrop-blur-sm transition-all duration-500 group-hover:shadow-2xl">
              {/* Price block */}
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
                    ${priceMonthly}
                  </span>
                  <span className="text-foreground-muted ml-2 text-base sm:text-lg">
                    /month
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {pricing.trialLine}
                </p>
              </motion.div>

              {/* Benefits */}
              <motion.ul
                className="space-y-3 mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {pricing.benefits.map((benefit, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start group/feature"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.08 + 0.3,
                      duration: 0.5,
                    }}
                  >
                    <div className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-sm text-foreground-muted group-hover/feature:text-foreground transition-colors duration-300">
                      {benefit}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Simplicity line */}
              <motion.p
                className="text-sm text-foreground-muted text-center mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {pricing.simplicityLine}
              </motion.p>

              {/* CTA */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Link href="/auth/signup">
                  <Button
                    size="default"
                    className="w-full bg-black text-white hover:bg-dark-gray hover:shadow-xl transition-all duration-300 text-sm sm:text-base py-3 sm:py-4 font-semibold"
                    onClick={() => {
                      // PostHog: Capture pricing CTA click
                      posthog.capture("pricing_cta_clicked", {
                        price_monthly: priceMonthly,
                        cta_text: pricing.ctaText,
                        location: "pricing_section",
                      });
                    }}
                  >
                    {pricing.ctaText}
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  No credit card required
                </p>
              </motion.div>
            </Card>
          </motion.div>
        </div>

        {/* Trust strip */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-6 py-3 text-sm text-foreground-muted">
            <span>Cancel anytime</span>
            <span className="hidden sm:inline">·</span>
            <span>14-day free trial</span>
            <span className="hidden sm:inline">·</span>
            <span>5-minute setup</span>
          </div>
        </motion.div>
        {/* Comparison: alternatives vs Shelfcue */}
        <motion.div
          className="max-w-2xl mx-auto my-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="rounded-xl border border-border bg-muted/50 px-4 py-4 sm:px-6 sm:py-5"
            role="region"
            aria-label="Compare cost"
          >
            <p className="text-xs text-foreground-muted text-center mb-3 sm:mb-4">
              Forms + scheduling + automation elsewhere can cost 3–4x more.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center justify-center gap-2 sm:gap-4 text-sm text-foreground-muted">
                {alternatives.map((alt, i) => (
                  <span key={alt.name}>
                    {alt.name} ${alt.price}
                    {i < alternatives.length - 1 && (
                      <span className="hidden sm:inline mx-1">·</span>
                    )}
                  </span>
                ))}
              </div>
              <span className="text-sm text-foreground-muted text-center sm:text-left">
                = ${totalAlternatives}/mo elsewhere
              </span>
              <span className="text-sm font-semibold text-foreground text-center sm:text-left">
                Shelfcue ${priceMonthly}/mo — Save ${savings}/mo
              </span>
            </div>
            <p className="text-xs text-foreground-muted text-center mt-3">
              Based on entry-level plan pricing. Check each provider for current
              pricing.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
