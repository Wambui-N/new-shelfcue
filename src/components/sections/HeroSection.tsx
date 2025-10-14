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
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-background/50 pt-20">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-16 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight"
        >
          <span className="block text-foreground">Never Lose</span>
          <span className="block text-dark-gray">
            Another Lead
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-foreground-muted mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          The effortless lead capture system that syncs to Google Sheets in 60
          seconds.{" "}
          <span className="text-foreground font-medium">
            No complex setup. No technical skills needed.
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8"
        >
          <Link href="/auth/signup">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="default"
                className="group bg-black text-white hover:bg-dark-gray shadow-md hover:shadow-lg transition-all duration-300 text-sm px-6 py-3 rounded-lg font-medium"
              >
                <span className="mr-2">Start Your 14-Day Free Trial</span>
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
            className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors duration-300 text-sm font-medium group px-4 py-2"
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
          className="text-xs sm:text-sm text-foreground-muted max-w-xl mx-auto"
        >
          Trusted by{" "}
          <span className="font-semibold text-foreground">
            1,000+ founders, coaches, and consultants
          </span>{" "}
          to capture{" "}
          <span className="font-semibold text-foreground">50,000+ leads</span>
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-6 h-10 border-2 border-foreground-light rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-foreground-light rounded-full mt-2"
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
