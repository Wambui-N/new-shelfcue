"use client";

import { motion } from "framer-motion";
import { Palette, Share2, Wand2 } from "lucide-react";

export function SolutionSection() {
  const steps = [
    {
      icon: Wand2,
      title: "Create",
      description: "Build your perfect form in seconds",
      color: "bg-dark-gray",
      delay: 0,
    },
    {
      icon: Palette,
      title: "Customize",
      description: "Add your branding with one click",
      color: "bg-light-gray",
      delay: 0.2,
    },
    {
      icon: Share2,
      title: "Capture",
      description: "Share your link and get leads instantly",
      color: "bg-black",
      delay: 0.4,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
      <motion.div
        className="container mx-auto max-w-5xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Meet Your{" "}
            <span className="text-dark-gray">
              Unbreakable Lead Pipeline
            </span>
          </h2>
          <p className="text-base md:text-lg text-foreground-muted max-w-2xl mx-auto">
            3-Step Magic
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: step.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 h-full hover:shadow-lg">
                {/* Step Number */}
                <motion.div
                  className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-sm shadow-md"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {index + 1}
                </motion.div>

                {/* Icon */}
                <motion.div
                  className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500`}
                  whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-foreground-muted group-hover:text-foreground transition-colors duration-300">
                  {step.description}
                </p>

                {/* Decorative Line */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-light-gray"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

