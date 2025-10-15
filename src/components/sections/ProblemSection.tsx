"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

export function ProblemSection() {
  const problems = [
    "Google Forms look unprofessional and hurt your brand",
    "No way to make Google Forms match your website design",
    "Can't embed Google Forms without ugly iframe borders",
    "Google Forms don't work well on mobile devices",
    "Manual data export from Google Forms wastes hours every week",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <motion.div
        className="container mx-auto max-w-4xl"
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
                Sick of Ugly{" "}
                <span className="text-dark-gray">
                  Google Forms?
                </span>
              </h2>
        </motion.div>

        <motion.div
          className="space-y-3 max-w-2xl mx-auto"
          variants={containerVariants}
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
              whileHover={{ x: 2 }}
            >
              <div className="flex items-start gap-3 p-4 rounded-lg bg-light-gray/30 border border-light-gray transition-all duration-300 group-hover:border-dark-gray">
                <motion.div
                  className="flex-shrink-0 w-5 h-5 rounded-full bg-light-gray flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <X className="w-3 h-3 text-black" />
                </motion.div>
                <p className="text-sm text-foreground-muted group-hover:text-foreground transition-colors duration-300">
                  {problem}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

