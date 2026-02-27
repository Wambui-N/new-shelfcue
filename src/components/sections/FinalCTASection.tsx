"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

export function FinalCTASection() {
  const benefits = [
    "Free",
    "No credit card required",
    "Unlimited everything",
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="container mx-auto max-w-4xl relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Headline */}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
            Schedule calls, capture client info, and organize everything
            automatically. All in one place.
          </h2>

          {/* Sub-headline */}
          {/* <motion.p
            className="text-sm sm:text-base md:text-lg text-foreground-muted mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Try Shelfcue free for 14 days. Build a form, connect your Google
            Sheet, and see how effortless it can be to manage leads, bookings,
            and submissions all in one place.
          </motion.p> */}

          {/* CTA Button */}
          <motion.div
            className="mb-6 sm:mb-8 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/auth/signup"
              onClick={() => {
                posthog.capture("final_cta_clicked", {
                  cta_text: "Get started free",
                  location: "final_cta_section",
                });
              }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="default"
                  className="group bg-black text-white hover:bg-dark-gray hover:shadow-xl transition-all duration-300 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold w-full sm:w-auto"
                >
                  <span className="mr-2">Get started free</span>
                  <motion.div
                    className="inline-block"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Free!
            </p>
          </motion.div>

          {/* Risk Reversal */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-foreground-muted"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full bg-light-gray flex items-center justify-center"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-2 h-2 text-black" />
                </motion.div>
                <span className="font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-light-gray/20 rounded-lg border border-light-gray"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-sm font-semibold text-foreground">
              Works with your Google Calendar and Sheets
            </span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-light-gray/20 rounded-lg border border-light-gray"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-sm font-semibold text-foreground">
              Works automatically in the background
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
