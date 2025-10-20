"use client";

import { motion } from "framer-motion";
import { Check, Crown, Shield, X, Zap } from "lucide-react";

export function ComparisonSection() {
  const comparisons = [
    {
      category: "Setup & Ease of Use",
      features: [
        {
          name: "No-code form builder",
          shelfcue: true,
          competitor1: false,
          competitor2: true,
        },
        {
          name: "60-second setup",
          shelfcue: true,
          competitor1: false,
          competitor2: false,
        },
        {
          name: "Drag & drop interface",
          shelfcue: true,
          competitor1: true,
          competitor2: false,
        },
        {
          name: "Mobile responsive",
          shelfcue: true,
          competitor1: true,
          competitor2: true,
        },
      ],
    },
    {
      category: "Integrations & Automation",
      features: [
        {
          name: "Google Sheets sync",
          shelfcue: true,
          competitor1: true,
          competitor2: false,
        },
        {
          name: "CRM integrations",
          shelfcue: true,
          competitor1: false,
          competitor2: true,
        },
        {
          name: "Webhook support",
          shelfcue: true,
          competitor1: true,
          competitor2: true,
        },
        {
          name: "Zapier integration",
          shelfcue: true,
          competitor1: false,
          competitor2: false,
        },
      ],
    },
    {
      category: "Analytics & Insights",
      features: [
        {
          name: "Real-time analytics",
          shelfcue: true,
          competitor1: true,
          competitor2: false,
        },
        {
          name: "Conversion tracking",
          shelfcue: true,
          competitor1: false,
          competitor2: true,
        },
        {
          name: "Custom reports",
          shelfcue: true,
          competitor1: false,
          competitor2: true,
        },
        {
          name: "Export capabilities",
          shelfcue: true,
          competitor1: true,
          competitor2: true,
        },
      ],
    },
    {
      category: "Security & Compliance",
      features: [
        {
          name: "GDPR compliant",
          shelfcue: true,
          competitor1: true,
          competitor2: false,
        },
        {
          name: "SSL encryption",
          shelfcue: true,
          competitor1: true,
          competitor2: true,
        },
        {
          name: "Data backup",
          shelfcue: true,
          competitor1: false,
          competitor2: true,
        },
        {
          name: "Audit logs",
          shelfcue: true,
          competitor1: false,
          competitor2: false,
        },
      ],
    },
  ];

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

  const tableVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section
      id="comparison"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-background"
    >
      <motion.div
        className="container mx-auto max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ShelfCue?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how we stack up against the competition. Built for founders who
            value simplicity and results.
          </p>
        </motion.div>

        <motion.div variants={tableVariants} className="space-y-8">
          {comparisons.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              className="bg-card rounded-2xl p-8 border border-border shadow-sm"
              variants={tableVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                >
                  {categoryIndex === 0 && (
                    <Zap className="w-6 h-6 text-yellow-500" />
                  )}
                  {categoryIndex === 1 && (
                    <Shield className="w-6 h-6 text-blue-500" />
                  )}
                  {categoryIndex === 2 && (
                    <Crown className="w-6 h-6 text-purple-500" />
                  )}
                  {categoryIndex === 3 && (
                    <Shield className="w-6 h-6 text-green-500" />
                  )}
                </motion.div>
                {category.category}
              </h3>

              <div className="overflow-hidden">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground mb-4">
                  <div>Feature</div>
                  <div className="text-center">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      ShelfCue
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                      Typeform
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                      Google Forms
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature.name}
                      className="grid grid-cols-4 gap-4 py-3 border-b border-border/50 last:border-0"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: featureIndex * 0.1, duration: 0.5 }}
                    >
                      <div className="font-medium text-foreground">
                        {feature.name}
                      </div>
                      <div className="flex justify-center">
                        <motion.div
                          animate={{
                            scale: feature.shelfcue
                              ? [1, 1.2, 1]
                              : [0.8, 1, 0.8],
                            backgroundColor: feature.shelfcue
                              ? "#151419"
                              : "#cfcecb",
                          }}
                          transition={{
                            duration: feature.shelfcue ? 2 : 1,
                            repeat: feature.shelfcue ? Infinity : 0,
                          }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            feature.shelfcue
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {feature.shelfcue ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </motion.div>
                      </div>
                      <div className="flex justify-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            feature.competitor1
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {feature.competitor1 ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            feature.competitor2
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {feature.competitor2 ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Crown className="w-5 h-5" />
            <span>Join 10,000+ businesses already using ShelfCue</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
