"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  DollarSign,
  Link2,
  Puzzle,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tools = [
  { name: "Calendly", icon: Calendar, cost: "$12/mo", feature: "Basic scheduling" },
  { name: "Typeform", icon: Puzzle, cost: "$25/mo", feature: "Beautiful forms" },
  { name: "Simple CRM", icon: Link2, cost: "$15/mo", feature: "Lead tracking" },
  { name: "Zapier", icon: Zap, cost: "$20/mo", feature: "Automation" },
];

const comparison = [
  { feature: "Smart Scheduling", tools: "❌", shelfcue: "✅" },
  { feature: "Custom Form Builder", tools: "❌", shelfcue: "✅" },
  { feature: "Lead Management", tools: "❌", shelfcue: "✅" },
  { feature: "Google Integration", tools: "❌", shelfcue: "✅" },
  { feature: "Real-time Tracking", tools: "❌", shelfcue: "✅" },
  { feature: "Single Dashboard", tools: "❌", shelfcue: "✅" },
];

export function ComparisonSection() {
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
    hidden: { opacity: 0, y: 30 },
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
    <section
      id="comparison"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
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
      </div>

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 bg-light-gray/30 text-black rounded-full text-xs font-medium mb-6 border border-light-gray"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <DollarSign className="w-3 h-3" />
            <span>Save Money, Save Time</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Stop Paying for{" "}
            <span className="text-primary">4 Separate Tools</span>
          </h2>

          <p className="text-base md:text-lg text-foreground-muted max-w-3xl mx-auto leading-relaxed">
            Replace multiple subscriptions with one affordable solution
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
          variants={itemVariants}
        >
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <motion.div
                key={tool.name}
                whileHover={{ y: -5, scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 text-center border-2 border-muted hover:border-primary transition-colors">
                  <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {tool.name}
                  </p>
                  <p className="text-xs text-foreground-muted">{tool.feature}</p>
                  <p className="text-sm font-bold text-primary mt-2">
                    {tool.cost}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Plus Icon with = Shelfcue */}
            <motion.div
          className="flex items-center justify-center mb-8"
          variants={itemVariants}
        >
                <motion.div
            className="text-4xl font-bold text-foreground"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            +
          </motion.div>
          <motion.span
            className="mx-4 text-6xl text-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
              duration: 2,
                    repeat: Infinity,
                  }}
                >
            =
          </motion.span>
          <div className="flex items-center gap-3 bg-primary/10 px-6 py-4 rounded-2xl border-2 border-primary">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Image
                src="/1.png"
                alt="Shelfcue"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-foreground">Shelfcue</p>
              <p className="text-sm text-primary font-semibold">$29/mo</p>
            </div>
          </div>
        </motion.div>

        {/* Comparison Table */}
                    <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          variants={itemVariants}
        >
          {/* Before - Multiple Tools */}
          <Card className="p-6 border-2 border-muted">
            <div className="flex items-center gap-2 mb-6">
              <X className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-foreground">Before</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-foreground-muted">Total Cost</span>
                <span className="text-2xl font-bold text-foreground">$72/mo</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-foreground-muted">No. of Tools</span>
                <span className="text-xl font-semibold text-foreground">4</span>
                      </div>
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-foreground-muted">Complexity</span>
                <span className="text-xl font-semibold text-red-500">High</span>
                      </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-foreground-muted">Connected</span>
                <span className="text-xl font-semibold text-red-500">❌</span>
                        </div>
                      </div>
          </Card>

          {/* After - Shelfcue */}
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-2 mb-6">
              <Check className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">After</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-foreground-muted">Total Cost</span>
                <span className="text-2xl font-bold text-primary">$29/mo</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-foreground-muted">No. of Tools</span>
                <span className="text-xl font-semibold text-primary">1</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-foreground-muted">Complexity</span>
                <span className="text-xl font-semibold text-primary">Low</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-foreground-muted">Connected</span>
                <span className="text-xl font-semibold text-primary">✅</span>
                        </div>
                      </div>
          </Card>
                    </motion.div>

        {/* Feature Comparison */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-muted">
            <h3 className="text-xl font-bold text-center mb-6 text-foreground">
              Feature Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-3 text-sm font-semibold text-foreground-muted">
                      Feature
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-foreground-muted">
                      Other Tools
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-primary">
                      Shelfcue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((item) => (
                    <tr
                      key={item.feature}
                      className="border-b border-muted hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 text-foreground font-medium">
                        {item.feature}
                      </td>
                      <td className="text-center py-3 text-foreground-muted">
                        {item.tools}
                      </td>
                      <td className="text-center py-3 text-primary font-bold">
                        {item.shelfcue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          variants={itemVariants}
        >
          <Button
            asChild
            className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg font-semibold shadow-xl"
            size="lg"
          >
            <a href="/auth/signup">
              Start Your 14-Day Free Trial
            </a>
          </Button>
          <p className="text-sm text-foreground-muted mt-4">
            Save $516/year. No credit card required.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
