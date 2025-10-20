"use client";

import { motion } from "framer-motion";
import { AlertCircle, Zap } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      title: "Outdated Design",
      description: "Forms look unprofessional and hurt your brand",
      icon: AlertCircle,
    },
    {
      title: "No Branding",
      description: "Can't match your website or upload logos",
      icon: AlertCircle,
    },
    {
      title: "Poor Mobile",
      description: "Forms don't work well on mobile devices",
      icon: AlertCircle,
    },
    {
      title: "Manual Work",
      description: "Hours wasted on manual data exports",
      icon: AlertCircle,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-dark-gray rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-light-gray rounded-full blur-3xl" />
      </div>

      <motion.div
        className="container mx-auto max-w-5xl relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
        

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            The Frustration Behind{" "}
            <span className="text-dark-gray">Every Form</span>
          </h2>
          
          <p className="text-base md:text-lg text-foreground-muted max-w-3xl mx-auto leading-relaxed">
            Most form tools look outdated, feel rigid, and trap your data behind paywalls or confusing dashboards. 
            You want something that just works, that looks good on your website, matches your brand, and sends data exactly where you need it.
          </p>
        </motion.div>

        {/* Problems Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          variants={containerVariants}
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="group"
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-dark-gray transition-all duration-500 h-full hover:shadow-lg hover:shadow-dark-gray/10">
                {/* Icon */}
                <motion.div
                  className="w-12 h-12 bg-light-gray/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-light-gray/50 transition-colors duration-300"
                  variants={iconVariants}
                  whileHover="hover"
                >
                  <problem.icon className="w-6 h-6 text-dark-gray" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-dark-gray transition-colors duration-300">
                  {problem.title}
                </h3>
                
                <p className="text-sm text-foreground-muted leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                  {problem.description}
                </p>

                {/* Decorative Element */}
                <motion.div
                  className="absolute top-6 right-6 w-2 h-2 bg-dark-gray rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6 }}
                />
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
          
        </motion.div>
      </motion.div>
    </section>
  );
}

