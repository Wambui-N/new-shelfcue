"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const faqs = [
    {
      question: "Is it secure?",
      answer:
        "When someone submits a form it's written directly to a Google Sheet file. That means your data lives in your Google account and you control access. Shelfcue uses secure authentication to connect to Google and follows standard security practices. We do not sell your data. See our full Privacy & Security page for details.",
      answerLink: { href: "/privacy", label: "Privacy Policy" },
    },
    {
      question: "Can I use the forms on my phone?",
      answer:
        "Yes! All Shelfcue forms are mobile-responsive and work perfectly on phones, tablets, and computers. Your forms will look great and work smoothly on any device.",
    },
    {
      question: "Do I need a Google account?",
      answer:
        "Yes. Shelfcue connects to your Google Sheets and uses Google sign-in, so you need a Google account to create forms, store submissions, and manage your data. If you already use Gmail or Google Workspace, you're all set.",
    },
    {
      question: "What skills do I need?",
      answer:
        "Shelfcue connects directly to Google Sheets with one click. No Zapier needed. No coding required. Everything works automatically once you connect your Google account.",
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
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Questions?{" "}
              <span className="text-dark-gray">We Have Answers.</span>
            </h2>

            <p className="text-base md:text-lg text-foreground-muted max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about Shelfcue.
            </p>
          </motion.div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = openItems.has(index);

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="border border-border rounded-lg overflow-hidden bg-card"
                >
                  <motion.button
                    onClick={() => toggleItem(index)}
                    className="w-full text-left p-4 sm:p-5 bg-background hover:bg-background-secondary transition-all duration-300 group"
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4
                        className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                          isOpen ? "text-primary" : "text-foreground"
                        } group-hover:text-primary`}
                      >
                        {faq.question}
                      </h4>
                      <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-8 h-8 flex items-center justify-center shrink-0 rounded-full border border-border transition-colors duration-300 ${
                          isOpen
                            ? "text-primary border-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span className="text-lg font-bold leading-none">+</span>
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
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                          <div className="w-full h-px bg-border mb-4" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                            {"answerLink" in faq && faq.answerLink && (
                              <>
                                {" "}
                                <Link
                                  href={faq.answerLink.href}
                                  className="text-foreground font-medium underline hover:no-underline"
                                >
                                  {faq.answerLink.label}
                                </Link>
                                .
                              </>
                            )}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Contact CTA */}
          {/* <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3 bg-light-gray/30 rounded-xl border border-light-gray"
              whileHover={{ scale: 1.02, y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center sm:text-left">
                <p className="text-foreground font-medium text-sm mb-1">
                  Still have questions?
                </p>
                <p className="text-foreground-muted text-xs">
                  Our support team is here to help
                </p>
              </div>
              <motion.button
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-dark-gray transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Support
              </motion.button>
            </motion.div>
          </motion.div> */}
        </motion.div>
      </section>
    </>
  );
}
