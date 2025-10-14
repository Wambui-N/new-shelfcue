"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PricingSection() {
  const plan = {
    name: "The Founders' Offer",
    price: "$29",
    period: "month",
    description: "Everything included",
    features: [
      "Unlimited forms & submissions",
      "All features included",
      "Priority support",
      "14-day free trial, no credit card",
    ],
    cta: "Start Your 14-Day Free Trial",
    color: "text-black",
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
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-6 border border-primary/20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="w-3 h-3" />
            <span>Pricing That Scales</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Simple,{" "}
            <span className="text-dark-gray">
              Transparent Pricing
            </span>
          </h2>

          <p className="text-base md:text-lg text-foreground-muted max-w-3xl mx-auto leading-relaxed">
            One plan, all features.{" "}
            <span className="text-foreground font-medium">No surprises.</span>
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -12,
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
            className="relative group"
          >
            <Card className="relative p-8 border-2 border-primary shadow-xl bg-card/95 backdrop-blur-sm transition-all duration-500 group-hover:shadow-2xl">
              {/* Popular Badge */}
              <motion.div
                className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold flex items-center shadow-lg">
                  <Crown className="w-4 h-4 mr-2" />
                  Most Popular
                </div>
              </motion.div>

              {/* Header */}
              <motion.div
                className="text-center mb-8 mt-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <motion.h3
                  className="text-2xl font-bold text-foreground mb-4"
                  whileHover={{ scale: 1.02 }}
                >
                  {plan.name}
                </motion.h3>

                <motion.div
                  className="mb-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className={`text-4xl md:text-5xl font-bold ${plan.color}`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-foreground-muted ml-2 text-lg">
                    /{plan.period}
                  </span>
                </motion.div>

                <p className="text-base text-foreground-muted leading-relaxed">
                  {plan.description}
                </p>
              </motion.div>

              {/* Features List */}
              <motion.ul
                className="space-y-3 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    className="flex items-start group/feature"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: featureIndex * 0.1 + 0.4,
                      duration: 0.5,
                    }}
                  >
                    <motion.div
                      className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                    <span className="text-sm text-foreground-muted group-hover/feature:text-foreground transition-colors duration-300">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* CTA Button */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Link href="/auth/signup">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="default"
                      className="w-full bg-black text-white hover:bg-dark-gray hover:shadow-xl transition-all duration-300 text-base py-4 font-semibold"
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Decorative Corner */}
              <motion.div
                className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={false}
              />
            </Card>
          </motion.div>
        </div>

        {/* Guarantee */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-4 bg-light-gray/30 text-black rounded-2xl border border-light-gray"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex items-center gap-2"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-5 h-5" />
              <span className="font-semibold">No credit card required</span>
            </motion.div>
            <div className="w-px h-6 bg-light-gray" />
            <span className="font-semibold">Cancel anytime</span>
            <div className="w-px h-6 bg-light-gray" />
            <span className="font-semibold">5-minute setup</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
