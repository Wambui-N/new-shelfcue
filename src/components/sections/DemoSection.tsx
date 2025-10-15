"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Create Form",
      description: "Design your lead capture form in seconds",
      content: "Newsletter Signup Form",
    },
    {
      title: "Add Fields",
      description: "Drag and drop form fields with ease",
      content: "Name, Email, Company, Message",
    },
    {
      title: "Customize Design",
      description: "Match your brand colors and styling",
      content: "Modern, Clean Interface",
    },
    {
      title: "Integrate & Publish",
      description: "Connect to Google Sheets and go live",
      content: "Live Form Ready!",
    },
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <section id="demo" className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* Section Intro */}
        <motion.div
          className="text-center mb-12 lg:hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            See It In <span className="text-dark-gray">Action</span>
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-foreground-muted max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Watch how easy it is to create professional lead capture forms that
            convert.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[60vh] lg:min-h-[80vh]">
          {/* Left Side - Demo Preview (Takes up more than half width) */}
          <motion.div
            className="lg:col-span-7 relative lg:sticky lg:top-0 lg:h-screen lg:flex lg:items-center lg:justify-center mb-8 lg:mb-0"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Laptop Frame */}
            <motion.div
              className="relative mx-auto bg-dark-gray rounded-xl lg:rounded-2xl p-2 lg:p-3 shadow-2xl border-2 border-light-gray w-full max-w-4xl"
            >
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-2 lg:mb-3 pb-2 border-b border-light-gray/50">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-light-gray"></div>
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-light-gray"></div>
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-light-gray"></div>
                </div>
                <div className="flex-1 bg-background rounded-md px-2 lg:px-3 py-1 lg:py-1.5 text-xs text-foreground-muted">
                  shelfcue.com/demo
                </div>
              </div>

              {/* Demo Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  className="h-[300px] sm:h-[400px] lg:h-[600px] flex flex-col items-center justify-center text-center p-4 sm:p-6 lg:p-8 bg-background/95"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-light-gray/30 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 text-black"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <span className="text-2xl sm:text-3xl lg:text-4xl">
                      {currentStep === 0 && "📝"}
                      {currentStep === 1 && "📋"}
                      {currentStep === 2 && "🎨"}
                      {currentStep === 3 && "🚀"}
                    </span>
                  </motion.div>

                  <motion.h3
                    className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-2 sm:mb-3 lg:mb-4"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {demoSteps[currentStep].title}
                  </motion.h3>

                  <motion.p className="text-foreground-muted text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 lg:mb-8 max-w-lg px-4">
                    {demoSteps[currentStep].description}
                  </motion.p>

                  <motion.div
                    className="w-full max-w-lg bg-white rounded-lg p-4 sm:p-6 lg:p-8 border border-light-gray shadow-sm mx-4"
                    animate={{
                      boxShadow: [
                        "0 2px 8px rgba(0,0,0,0.05)",
                        "0 4px 16px rgba(0,0,0,0.1)",
                        "0 2px 8px rgba(0,0,0,0.05)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <div className="text-left space-y-4">
                      <div className="h-3 bg-light-gray rounded animate-pulse"></div>
                      <div className="h-3 bg-light-gray rounded w-3/4 animate-pulse"></div>
                      <div className="h-12 bg-light-gray/50 rounded"></div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
            </motion.div>

          {/* Right Side - Descriptions & Controls */}
          <motion.div
            className="lg:col-span-5 space-y-8 lg:pl-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Section Intro - Desktop Only */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                See It In <span className="text-dark-gray">Action</span>
              </motion.h2>
              <motion.p
                className="text-sm text-foreground-muted"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Watch how easy it is to create professional lead capture forms that
                convert.
              </motion.p>
            </motion.div>

            {/* Demo Steps - Descriptive Areas */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {demoSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-all duration-500 ${
                    currentStep === index
                      ? "border-black bg-light-gray/20 shadow-md"
                      : "border-light-gray hover:border-dark-gray"
                  }`}
              animate={{
                    scale: currentStep === index ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        currentStep === index
                          ? "bg-black text-white"
                          : "bg-light-gray text-dark-gray"
                      }`}
                      animate={{
                        backgroundColor:
                          currentStep === index ? "#151419" : "#cfcecb",
                        color: currentStep === index ? "#fafafa" : "#585552",
                      }}
                    >
                      {index + 1}
                    </motion.div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold mb-1 text-xs transition-colors duration-300 ${
                          currentStep === index
                            ? "text-foreground"
                            : "text-foreground-muted"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-foreground-muted text-xs leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

                {/* Controls */}
                <motion.div
                  className="flex flex-col sm:flex-row justify-center lg:justify-start gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-dark-gray transition-colors duration-300 text-xs sm:text-sm font-medium w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    {isPlaying ? "Pause" : "Play Demo"}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setCurrentStep(0);
                      setIsPlaying(false);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-light-gray text-foreground-muted rounded-lg hover:bg-light-gray/30 transition-all duration-300 text-xs sm:text-sm font-medium w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                    Reset
                  </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
