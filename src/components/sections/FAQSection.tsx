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
      category: "Setup & Getting Started",
      icon: <Zap className="w-6 h-6" />,
      color: "text-yellow-500",
      questions: [
        {
          question: "How long does setup really take?",
          answer:
            "Most users have their first form live in under 2 minutes. Our intuitive builder and streamlined process means you can start capturing leads almost instantly—no complex configuration needed.",
        },
        {
          question: "Do I need a website?",
          answer:
            "No! Every form gets a beautiful standalone page and QR code. You can share your form link anywhere—social media, email, or print the QR code. No website required.",
        },
      ],
    },
    {
      category: "Reliability & Support",
      icon: <Shield className="w-6 h-6" />,
      color: "text-blue-500",
      questions: [
        {
          question: "What if the Google Sheets sync breaks?",
          answer:
            "That's what our \"Never Lose a Lead\" guarantee is for! We temporarily store all submissions as backup. If the sync fails for any reason, your leads are safe and will be synced automatically once the connection is restored.",
        },
      ],
    },
    {
      category: "Billing & Cancellation",
      icon: <CreditCard className="w-6 h-6" />,
      color: "text-green-500",
      questions: [
        {
          question: "Can I cancel anytime?",
          answer:
            "Yes, no lock-in. You can cancel anytime with one click. You'll still have access until the end of your billing period, and you can export all your data instantly.",
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
      },
    },
  };

  return (
    <section
      id="faq"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-background-secondary relative overflow-hidden"
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
            <HelpCircle className="w-3 h-3" />
            <span>Got Questions?</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Questions?{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              We Have Answers.
            </span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about Shelfcue.
          </p>
        </motion.div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              variants={categoryVariants}
              className="bg-card rounded-xl p-6 border border-border shadow-sm"
            >
              <motion.h3
                className="text-lg font-bold text-foreground mb-6 flex items-center gap-3"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 ${category.color}`}
                  animate={{
                    rotate: [0, 3, -3, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                >
                  {category.icon}
                </motion.div>
                {category.category}
              </motion.h3>

              <div className="space-y-3">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 10 + faqIndex;
                  const isOpen = openItems.has(globalIndex);

                  return (
                    <motion.div
                      key={faqIndex}
                      className="border border-border rounded-lg overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: faqIndex * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.005 }}
                    >
                      <motion.button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full text-left p-4 bg-background hover:bg-background-secondary transition-all duration-300 group"
                        whileHover={{
                          backgroundColor: "rgba(20, 20, 25, 0.02)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-semibold text-sm transition-colors duration-300 group-hover:text-primary ${
                              isOpen ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {faq.question}
                          </h4>
                          <motion.div
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.3 }}
                            className={`w-4 h-4 flex items-center justify-center ml-3 transition-colors duration-300 ${
                              isOpen ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            <span className="text-lg font-bold">+</span>
                          </motion.div>
                        </div>
                      </motion.button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2">
                              <div className="w-full h-px bg-border mb-3"></div>
                              <motion.p
                                className="text-sm text-muted-foreground leading-relaxed"
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
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20"
            whileHover={{ scale: 1.02, y: -1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center sm:text-left">
              <p className="text-foreground font-medium text-sm mb-1">
                Still have questions?
              </p>
              <p className="text-muted-foreground text-xs">
                Our support team is here to help
              </p>
            </div>
            <motion.button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-300"
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
