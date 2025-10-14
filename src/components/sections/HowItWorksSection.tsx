"use client";

import { motion } from "framer-motion";
import { Edit3, Palette, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Edit3,
      title: "Create Your Form",
      description:
        "Drag and drop fields to build exactly what you need. Start from scratch or use our intuitive builder.",
      color: "from-blue-600 to-cyan-600",
    },
    {
      number: "02",
      icon: Palette,
      title: "Customize Your Style",
      description:
        "Add your logo, choose colors, and make it yours. No design experience required.",
      color: "from-purple-600 to-pink-600",
    },
    {
      number: "03",
      icon: Share2,
      title: "Share & Capture",
      description:
        "Get your unique link, QR code, or embed code. Start capturing leads immediately.",
      color: "from-orange-600 to-red-600",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
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
            Simple Form Building,{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              Powerful Results
            </span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent transform -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-6 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -8 }}
                className="relative"
              >
                <Card className="relative p-6 h-full border-2 border-border hover:border-primary/50 transition-all duration-500 group hover:shadow-xl bg-card/50 backdrop-blur-sm">
                  {/* Step Number Background */}
                  <motion.div
                    className={`absolute -top-4 left-6 text-6xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-10 select-none`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 0.1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                  >
                    {step.number}
                  </motion.div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-500`}
                      whileHover={{
                        rotate: [0, -5, 5, -5, 0],
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Step Number Label */}
                    <motion.div
                      className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3"
                      whileHover={{ scale: 1.05 }}
                    >
                      Step {index + 1}
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>

                  {/* Decorative Corner */}
                  <motion.div
                    className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-tl-full`}
                    initial={false}
                  />
                </Card>

                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

