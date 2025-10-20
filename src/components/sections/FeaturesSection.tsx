"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock, Sheet, Sparkles, Wand2, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: <Sheet className="w-8 h-8" />,
      title: "Google Sheets Integration, Built In",
      description:
        "Connect once, and every form submission updates your Google Sheet instantly. Use Sheets as your live database: filter, track, and analyze data your way.",
      gradient: "bg-black",
    },
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "Smart Form Builder",
      description:
        "Design responsive, on-brand forms with an intuitive drag-and-drop builder. Add custom fields, conditional logic, and layouts without touching code.",
      gradient: "bg-black",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Integrated Calendar & Booking",
      description:
        "Let clients book meetings directly from your forms. Sync seamlessly with Google Calendar or other scheduling tools.",
      gradient: "bg-black",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Brand-Level Customization",
      description:
        "Customize fonts, colors, layouts, and buttons. Responsive by default, so every form looks perfect on mobile, tablet, or desktop.",
      gradient: "bg-black",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Multi-Channel Sharing",
      description:
        "Share forms anywhere: Embed directly on your site, send a link, or add a QR code to print materials. All synced to your Google Sheet.",
      gradient: "bg-black",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Centralized Dashboard",
      description:
        "View, search, and manage submissions in one place. Connect to other tools via integrations or APIs.",
      gradient: "bg-black",
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

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section
      id="features"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-background-secondary relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_theme(colors.primary)_0%,_transparent_50%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_theme(colors.accent)_0%,_transparent_50%)] opacity-20" />
      </div>

      <motion.div
        className="container mx-auto relative z-10 max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
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
            <Sparkles className="w-3 h-3" />
            <span>Why Businesses Choose Shelfcue</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Everything You Need in One Platform
          </h2>

          <p className="text-base md:text-lg text-foreground-muted max-w-3xl mx-auto leading-relaxed">
            Build beautiful forms, collect data in Google Sheets, and manage
            everything from one intuitive dashboard. No technical skills
            required.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="group"
            >
              <Card className="relative p-4 sm:p-6 h-full border-0 shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-500 group-hover:bg-card">
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.gradient} rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-md`}
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    {feature.icon}
                  </motion.div>

                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground text-center group-hover:text-dark-gray transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed text-center group-hover:text-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect Border */}
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-light-gray transition-all duration-500"
                  initial={false}
                  whileHover={{ borderColor: "#cfcecb" }}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-light-gray/30 border border-light-gray rounded-lg text-black text-sm font-medium hover:bg-light-gray/50 transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ready to get started?</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
