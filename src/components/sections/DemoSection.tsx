"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) setIsPlaying(true);
  }, [inView]);

  const demoSteps = [
    {
      title: "Create",
      description: "Start with a template or from scratch to launch your form.",
      image: "/Create.png",
    },
    {
      title: "Customize",
      description: "Adjust fields and match the design to your branding.",
      image: "/Customize.png",
    },
    {
      title: "Publish & Capture",
      description: "Publish your form and start capturing leads.",
      image: "/Publish.png",
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
    <section
      ref={sectionRef}
      id="demo"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
    >
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
          {/* Left Side - Demo Preview (Just over half screen height) */}
          <motion.div
            className="lg:col-span-7 relative lg:sticky lg:top-0 lg:min-h-[55vh] lg:flex lg:items-center lg:justify-center mb-8 lg:mb-0"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Laptop Frame */}
            <motion.div className="relative mx-auto bg-dark-gray rounded-xl lg:rounded-2xl p-2 lg:p-3 shadow-2xl border-2 border-light-gray w-full max-w-4xl">
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-2 lg:mb-3 pb-2 border-b border-light-gray/50">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#febc2e]" aria-hidden />
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#28c840]" aria-hidden />
                </div>
                <div className="flex-1 bg-background rounded-md px-2 lg:px-3 py-1 lg:py-1.5 text-xs text-foreground-muted">
                  {`shelfcue.com/${demoSteps[currentStep].title.toLowerCase().replace(/\s+/g, "-")}`}
                </div>
              </div>

              {/* Demo Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  className="h-[220px] sm:h-[275px] lg:h-[380px] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background/95 overflow-hidden"
                  style={{ minHeight: "55vh" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div
                    className="relative w-full h-full max-w-2xl mx-auto rounded-lg overflow-hidden border border-light-gray shadow-sm bg-white"
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
                    <Image
                      src={demoSteps[currentStep].image}
                      alt={demoSteps[currentStep].title}
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 1024px) 100vw, 672px"
                      priority={currentStep === 0}
                    />
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
                Watch how easy it is to create professional lead capture forms
                that convert.
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
