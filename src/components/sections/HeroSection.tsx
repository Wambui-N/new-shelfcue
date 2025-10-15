"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/bg.webm" type="video/webm" />
        </video>
        {/* Smooth gradient transition at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-12 sm:py-16 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight px-2"
        >
          <span className="block text-foreground">The Beautiful Form Builder</span>
          <span className="block text-dark-gray">
            That Automatically Fills Your Google Sheets
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground-muted mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4"
        >
          Create branded, responsive forms that write directly into your Google Sheets.{" "}
          <span className="text-foreground font-medium">
            No Zapier. No hassle. No coding required.
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6 sm:mb-8 px-4"
        >
          <Link href="/auth/signup">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                    size="default"
                    className="group bg-black text-white hover:bg-dark-gray shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-medium w-full sm:w-auto"
                >
                    <span className="mr-2">Build Your First Form in Minutes</span>
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
              <motion.button
                onClick={() => {
                  const demoSection = document.querySelector("#demo");
                  demoSection?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors duration-300 text-sm font-medium group px-4 py-2 w-full sm:w-auto justify-center sm:justify-start"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
            <motion.div
              className="w-8 h-8 rounded-full bg-light-gray/50 flex items-center justify-center group-hover:bg-light-gray transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <Play className="w-4 h-4 text-black" fill="currentColor" />
            </motion.div>
            <span>Watch 1-Min Demo</span>
          </motion.button>
        </motion.div>

            {/* Social Proof */}
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-foreground-muted max-w-xl mx-auto px-4"
            >
              The perfect{" "}
              <span className="font-semibold text-foreground">
                Google Forms alternative
              </span>{" "}
              for{" "}
              <span className="font-semibold text-foreground">small businesses</span>{" "}
              who want beautiful, branded forms
            </motion.p>
      </motion.div>

    </section>
  );
}
