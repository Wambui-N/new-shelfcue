"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProblemSection() {
  const items = [
    {
      headline: "Booking a call shouldn't take five emails",
      frustratingNow:
        "You email. They reply late. You suggest new times. Something clashes. Before you know it, scheduling has turned into a mini project.",
      shelfcueFixes:
        "With Shelfcue, clients book directly from your form. They choose an available time that's already synced with your calendar. No emails, no chasing, no double-booking.",
    },
    {
      headline: "Your intake and scheduling are scattered",
      frustratingNow:
        "One tool for forms. Another for booking. Another to connect everything. Your data ends up in different places, and you're left stitching it together.",
      shelfcueFixes:
        "Shelfcue brings intake and booking into one simple flow. Every submission and booking is saved automatically to Google Sheets and Google Calendar.",
    },
    {
      headline: "Admin work is stealing time from real work",
      frustratingNow:
        "Copy-pasting details. Fixing incomplete info. Organizing bookings. It's necessary, but it's not what clients pay you for.",
      shelfcueFixes:
        "Shelfcue handles intake, booking, and record-keeping automatically. Once it's set up, it works quietly in the background so you can focus on consulting.",
    },
    {
      headline: "A messy intake makes you look unprepared",
      frustratingNow:
        "Generic forms, inconsistent information, and a disjointed onboarding experience can make even great consultants feel less polished than they are.",
      shelfcueFixes:
        "Shelfcue gives you clean, customizable forms that work on any device. Clients get a smooth, professional experience, and you get organized, reliable data every time.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-dark-gray rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-light-gray rounded-full blur-3xl" />
      </div>

      <motion.div
        className="container mx-auto max-w-5xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            The Problem With Your Current Intake and Booking Process
          </h2>

          <p className="text-base md:text-lg text-foreground-muted max-w-3xl mx-auto leading-relaxed">
            See what you have now versus what you gain when intake, booking, and
            data live in one place.
          </p>
        </motion.div>

        {/* Column headers */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-16 mb-8"
          variants={containerVariants}
        >
          <p className="text-base font-semibold text-foreground-muted uppercase tracking-wide flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-destructive" />
            What&apos;s frustrating now
          </p>
          <p className="text-base font-semibold text-foreground uppercase tracking-wide flex items-center gap-2 md:justify-start">
            <Check className="w-5 h-5 shrink-0 text-green-600" />
            How Shelfcue fixes it
          </p>
        </motion.div>

        {/* Rows: each row = one frustration (left) + corresponding fix (right) */}
        <motion.div
          className="space-y-10"
          variants={containerVariants}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-16 items-start"
              variants={itemVariants}
            >
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {item.headline}
                </h3>
                <p className="text-base text-foreground-muted leading-relaxed">
                  {item.frustratingNow}
                </p>
              </div>
              <div>
                <p className="text-base text-foreground leading-relaxed">
                  {item.shelfcueFixes}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Ready to fix this?
          </h3>
          <p className="text-base text-foreground-muted max-w-xl mx-auto mb-6">
            Bring intake and booking into one place and get back to the work
            that matters.
          </p>
          <Link href="/auth/signup">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="default"
                className="group bg-black text-white hover:bg-dark-gray shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-medium w-full sm:w-auto"
              >
                <span className="mr-2">Start free with Shelfcue</span>
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
            No credit card required
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
