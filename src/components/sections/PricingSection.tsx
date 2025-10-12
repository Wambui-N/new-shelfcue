"use client"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Star, Sparkles, Zap, Crown } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with lead capture",
      features: [
        "Up to 100 leads/month",
        "3 forms",
        "Google Sheets integration",
        "Email notifications",
        "Basic analytics",
        "Community support"
      ],
      cta: "Get Started Free",
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "For growing businesses that need more",
      features: [
        "Up to 10,000 leads/month",
        "Unlimited forms",
        "Google Sheets integration",
        "Advanced analytics",
        "Team collaboration",
        "Priority support",
        "Custom branding",
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true,
      color: "from-primary to-accent"
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large teams and high-volume needs",
      features: [
        "Unlimited leads",
        "Unlimited forms",
        "All Professional features",
        "Advanced security",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "Custom contracts"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "from-purple-500 to-pink-500"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="container mx-auto max-w-7xl relative z-10"
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
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8 border border-primary/20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pricing That Scales</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Choose Your
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Growth Path
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Start free, scale as you grow. No hidden fees, no surprises.
            <span className="text-foreground font-medium"> Just results.</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{
                y: plan.popular ? -12 : -8,
                scale: plan.popular ? 1.05 : 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className={`relative group ${plan.popular ? 'z-10' : ''}`}
            >
              <Card className={`relative p-8 h-full border-2 transition-all duration-500 ${
                plan.popular
                  ? 'border-primary shadow-2xl bg-card/95 backdrop-blur-sm scale-105'
                  : 'border-border hover:border-primary/30 hover:shadow-lg'
              }`}>
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                      <Crown className="w-4 h-4 mr-2" />
                      Most Popular
                    </div>
                  </motion.div>
                )}

                {/* Header */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <motion.h3
                    className="text-2xl font-bold text-foreground mb-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    {plan.name}
                  </motion.h3>

                  <motion.div
                    className="mb-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-2 text-lg">/{plan.period}</span>
                  </motion.div>

                  <p className="text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </motion.div>

                {/* Features List */}
                <motion.ul
                  className="space-y-4 mb-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                >
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className="flex items-start group/feature"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (index * 0.1) + (featureIndex * 0.1) + 0.4, duration: 0.5 }}
                    >
                      <motion.div
                        className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                      <span className="text-muted-foreground group-hover/feature:text-foreground transition-colors duration-300">
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
                  transition={{ delay: index * 0.1 + 0.8, duration: 0.6 }}
                >
                  {plan.name === "Enterprise" ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className={`w-full bg-gradient-to-r ${plan.color} text-white hover:shadow-lg transition-all duration-300`}>
                        {plan.cta}
                      </Button>
                    </motion.div>
                  ) : (
                    <Link href="/auth/signup">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className={`w-full ${plan.popular ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg` : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'} transition-all duration-300`}>
                          {plan.cta}
                        </Button>
                      </motion.div>
                    </Link>
                  )}
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-5 h-5" />
            </motion.div>
            <span className="font-medium">30-day money-back guarantee • No setup fees • Cancel anytime</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
