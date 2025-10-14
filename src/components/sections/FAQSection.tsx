"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  HelpCircle,
  MessageCircle,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const faqs = [
    {
      category: "Getting Started",
      icon: <Zap className="w-6 h-6" />,
      color: "text-yellow-500",
      questions: [
        {
          question: "How do I create my first form?",
          answer:
            "Creating your first form is simple! After signing up, click the 'Create Form' button in your dashboard. Choose from our pre-built templates or start from scratch. Customize the fields, styling, and settings, then publish it with a single click.",
        },
        {
          question: "Do I need technical skills to use ShelfCue?",
          answer:
            "Not at all! ShelfCue is designed for non-technical users. Our drag-and-drop form builder and intuitive interface make it easy for anyone to create professional forms without coding knowledge.",
        },
        {
          question: "How quickly can I get started?",
          answer:
            "You can have your first form live in under 60 seconds! Our streamlined onboarding process gets you up and running immediately after signing up.",
        },
      ],
    },
    {
      category: "Features & Integrations",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "text-blue-500",
      questions: [
        {
          question: "Which platforms do you integrate with?",
          answer:
            "We integrate with Google Sheets, Zapier, Slack, email services, CRM systems like HubSpot and Salesforce, and many more. We're constantly adding new integrations based on user feedback.",
        },
        {
          question: "Can I customize the look of my forms?",
          answer:
            "Absolutely! You can fully customize colors, fonts, layouts, and branding to match your website perfectly. We also offer white-label options for enterprise customers.",
        },
        {
          question: "Do you support conditional logic?",
          answer:
            "Yes! Our advanced form builder includes conditional logic that shows or hides fields based on user responses, creating dynamic and personalized form experiences.",
        },
      ],
    },
    {
      category: "Pricing & Billing",
      icon: <CreditCard className="w-6 h-6" />,
      color: "text-green-500",
      questions: [
        {
          question: "What's included in the free plan?",
          answer:
            "Our free Starter plan includes up to 100 leads per month, 3 forms, Google Sheets integration, email notifications, and basic analytics. It's perfect for testing and small projects.",
        },
        {
          question: "Can I change or cancel my plan anytime?",
          answer:
            "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and you'll only be charged for the time you've used the service.",
        },
        {
          question: "Do you offer refunds?",
          answer:
            "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team within 30 days for a full refund.",
        },
      ],
    },
  ];

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
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

  const categoryVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="faq"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="container mx-auto max-w-5xl relative z-10"
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
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Frequently Asked
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Everything you need to know about getting started with ShelfCue.
            <span className="text-foreground font-medium">
              {" "}
              Can't find what you're looking for? We're here to help.
            </span>
          </p>
        </motion.div>

        <div className="space-y-12">
          {faqs.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              variants={categoryVariants}
              className="bg-card rounded-2xl p-8 border border-border shadow-sm"
            >
              <motion.h3
                className="text-2xl font-bold text-foreground mb-8 flex items-center gap-4"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 ${category.color}`}
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {category.icon}
                </motion.div>
                {category.category}
              </motion.h3>

              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 10 + faqIndex;
                  const isOpen = openItems.has(globalIndex);

                  return (
                    <motion.div
                      key={faqIndex}
                      className="border border-border rounded-xl overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: faqIndex * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <motion.button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full text-left p-6 bg-background hover:bg-background-secondary transition-all duration-300 group"
                        whileHover={{
                          backgroundColor: "rgba(20, 20, 25, 0.02)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-semibold text-lg transition-colors duration-300 group-hover:text-primary ${
                              isOpen ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {faq.question}
                          </h4>
                          <motion.div
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.3 }}
                            className={`w-5 h-5 flex items-center justify-center ml-4 transition-colors duration-300 ${
                              isOpen ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            <span className="text-xl font-bold">+</span>
                          </motion.div>
                        </div>
                      </motion.button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-2">
                              <div className="w-full h-px bg-border mb-4"></div>
                              <motion.p
                                className="text-muted-foreground leading-relaxed"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                              >
                                {faq.answer}
                              </motion.p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center sm:text-left">
              <p className="text-foreground font-medium mb-1">
                Still have questions?
              </p>
              <p className="text-muted-foreground text-sm">
                Our support team is here to help
              </p>
            </div>
            <motion.button
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Support
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
