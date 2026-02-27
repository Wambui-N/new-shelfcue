"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  LayoutGrid,
  Sheet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: CalendarCheck,
      title: "Clients book from your form",
      description:
        "No more email ping-pong. They pick a time that syncs to your calendar in one step. No double-booking!",
      highlight: true,
    },
    {
      icon: Sheet,
      title: "Submissions land in Google Sheets",
      description:
        "Every response goes straight to your Sheet. One source of truth, no copy-pasting or lost data.",
      highlight: false,
    },
    {
      icon: Zap,
      title: "Runs in the background",
      description:
        "Set it up once. Intake and booking keep working so you can focus on clients, not admin.",
      highlight: false,
    },
    {
      icon: LayoutGrid,
      title: "Intake and booking in one place",
      description:
        "One flow instead of scattered tools. Forms and scheduling together, synced to Sheets and Calendar.",
      highlight: false,
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

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section
      id="features"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-background-secondary relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_theme(colors.primary)_0%,_transparent_50%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_theme(colors.accent)_0%,_transparent_50%)] opacity-20" />
      </div>

      <motion.div
        className="container mx-auto relative z-10 max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Header row: title + intro left, CTA right */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Why choose Shelfcue?
            </h2>
            <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
              Build beautiful forms, collect data in Google Sheets, and let
              clients book from the same flow. No technical skills required.
            </p>
          </div>
          <div className="shrink-0">
            <Link href="/auth/signup">
              <Button
                size="default"
                className="bg-black text-white hover:bg-dark-gray shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-medium"
              >
                <span className="mr-2">Start free with Shelfcue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* 4 cards in one row on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHighlight = feature.highlight;

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3 },
                }}
                className="group"
              >
                {isHighlight ? (
                  <div className="relative p-6 sm:p-8 h-full rounded-2xl bg-black text-white shadow-lg flex flex-col gap-6">
                    <motion.div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                      variants={iconVariants}
                      whileHover="hover"
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed flex-1">
                      {feature.description}
                    </p>
                    <Link href="/auth/signup">
                      <Button
                        size="default"
                        className="bg-white text-black hover:bg-white/90 rounded-lg font-medium w-full sm:w-auto"
                      >
                        Get started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Card className="relative p-6 sm:p-8 h-full border border-border rounded-2xl bg-card shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col">
                    <motion.div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black flex items-center justify-center mb-4 text-primary-foreground"
                      variants={iconVariants}
                      whileHover="hover"
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-foreground-muted leading-relaxed mb-6 flex-1">
                      {feature.description}
                    </p>
                    <Link href="/auth/signup">
                      <Button
                        size="default"
                        className="bg-black text-white hover:bg-dark-gray rounded-lg font-medium w-full sm:w-auto"
                      >
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
