"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, HelpCircle, Shield, Zap } from "lucide-react";
import { useState } from "react";

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const faqs = [
    {
      category: "Setup & Getting Started",
      icon: <Zap className="w-6 h-6" />,
      color: "text-black",
      questions: [
        {
          question: "How is this different from Google Forms?",
          answer:
            "ShelfCue creates beautiful, branded forms that match your website design. Unlike Google Forms, you can customize colors, add your logo, and embed forms without ugly borders. Plus, data flows directly into Google Sheets without any setup.",
        },
        {
          question: "Do I need Zapier or coding skills?",
          answer:
            "No! ShelfCue connects directly to Google Sheets with one click. No Zapier needed. No coding required. Everything works automatically once you connect your Google account.",
        },
      ],
    },
    {
      category: "Google Sheets Integration",
      icon: <Shield className="w-6 h-6" />,
      color: "text-dark-gray",
      questions: [
        {
          question: "How does the Google Sheets connection work?",
          answer:
            "Simply connect your Google account once. Every form submission automatically appears in your Google Sheets spreadsheet. You can choose which sheet and columns to use. It's that simple.",
        },
        {
          question: "Can I use existing Google Sheets?",
          answer:
            "Yes! You can connect to any existing Google Sheets spreadsheet. Choose which columns to use, and form data will flow right into your existing workflow.",
        },
      ],
    },
    {
      category: "Form Building & Customization",
      icon: <CreditCard className="w-6 h-6" />,
      color: "text-black",
      questions: [
        {
          question: "Can I make forms that match my brand?",
          answer:
            "Absolutely! Add your logo, choose your brand colors, and customize fonts. Make forms that look like they belong on your website, not generic Google Forms.",
        },
        {
          question: "Do the forms work on mobile devices?",
          answer:
            "Yes! All ShelfCue forms are mobile-responsive and work perfectly on phones, tablets, and computers. Your forms will look great and work smoothly on any device.",
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
    <>
      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.flatMap((category) =>
              category.questions.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            ),
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
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 bg-light-gray/30 text-black rounded-full text-xs font-medium mb-6 border border-light-gray"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <HelpCircle className="w-3 h-3" />
              <span>Got Questions?</span>
            </motion.div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Questions?{" "}
              <span className="text-dark-gray">We Have Answers.</span>
            </h2>

            <p className="text-base md:text-lg text-foreground-muted max-w-3xl mx-auto leading-relaxed">
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
                    className={`p-2 rounded-lg bg-light-gray/30 ${category.color}`}
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
                                isOpen
                                  ? "text-primary"
                                  : "text-muted-foreground"
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
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
