"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mobileStep, setMobileStep] = useState(0);
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

  const mobileDemoSteps = [
    {
      title: "Create",
      description: "Launch your form in seconds with our mobile-first builder.",
      image: "/Create.png",
    },
    {
      title: "Customize",
      description: "Design and customize on the go with our mobile app.",
      image: "/Customize.png",
    },
    {
      title: "Capture Leads",
      description: "Manage submissions right from your phone.",
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

  useEffect(() => {
    if (inView) {
      const interval = setInterval(() => {
        setMobileStep((prev) => (prev + 1) % mobileDemoSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-background"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            See It In <span className="text-dark-gray">Action</span>
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg text-foreground-muted max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Watch how easy it is to create professional lead capture forms that convert.
          </motion.p>
        </motion.div>

        {/* DESKTOP DEMO */}
        <div className="hidden sm:block">
          {/* Demo Preview - Centered */}
          <motion.div
            className="mb-8 sm:mb-10 lg:mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Laptop Frame */}
            <motion.div className="relative mx-auto bg-dark-gray rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 shadow-2xl border-2 border-light-gray w-full max-w-5xl">
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-light-gray/50">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#febc2e]" aria-hidden />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#28c840]" aria-hidden />
                </div>
                <div className="flex-1 bg-background rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-foreground-muted truncate">
                  {`shelfcue.com/${demoSteps[currentStep].title.toLowerCase().replace(/\s+/g, "-")}`}
                </div>
              </div>

              {/* Demo Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  className="h-[280px] sm:h-[360px] lg:h-[480px] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background/95 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div
                    className="relative w-full h-full max-w-3xl mx-auto rounded-lg overflow-hidden border border-light-gray shadow-sm bg-white"
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
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 85vw"
                      priority={currentStep === 0}
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Navigation Tabs & Controls */}
          <motion.div
            className="space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Tab Navigation */}
            <div className="flex flex-row gap-0 justify-center items-center">
              {demoSteps.map((step, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setCurrentStep(index);
                    setIsPlaying(false);
                  }}
                  className="relative flex-none group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Tab button */}
                  <div className={`px-6 py-4 rounded-t-xl transition-all duration-300 ${
                    currentStep === index
                      ? "bg-black text-white shadow-md"
                      : "bg-light-gray text-dark-gray hover:bg-light-gray/80"
                  }`}>
                    <h3 className="font-semibold text-base whitespace-nowrap">
                      {step.title}
                    </h3>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Step Descriptions - Below Tabs */}
            <motion.div
              className="bg-light-gray/30 rounded-b-lg sm:rounded-b-xl p-4 sm:p-6 lg:p-8 border border-light-gray border-t-0 sm:border-t"
              animate={{
                minHeight: "auto",
              }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-foreground-muted text-base sm:text-lg leading-relaxed max-w-2xl">
                    {demoSteps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Controls */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 sm:pt-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-dark-gray transition-colors duration-300 font-medium text-sm sm:text-base w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                {isPlaying ? "Pause" : "Play Demo"}
              </motion.button>
              <motion.button
                onClick={() => {
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-light-gray text-foreground-muted rounded-lg hover:bg-light-gray/50 transition-all duration-300 font-medium text-sm sm:text-base w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                Reset
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* MOBILE DEMO */}
        <div className="sm:hidden">
          <motion.div
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Phone Frame */}
            <div className="relative mx-auto w-full max-w-xs">
              {/* Phone Bezel */}
              <div className="relative bg-black rounded-[2.5rem] p-3 shadow-2xl border-8 border-dark-gray">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
                
                {/* Screen */}
                <div className="relative bg-background rounded-[2rem] overflow-hidden aspect-[9/19.5] flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mobileStep}
                      className="w-full h-full flex items-center justify-center p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="relative w-full h-full rounded-lg overflow-hidden border border-light-gray bg-white">
                        <Image
                          src={mobileDemoSteps[mobileStep].image}
                          alt={mobileDemoSteps[mobileStep].title}
                          fill
                          className="object-cover object-center"
                          sizes="100vw"
                          priority={mobileStep === 0}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Mobile Navigation & Description */}
            <motion.div
              className="w-full space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Arrow Navigation */}
              <div className="flex justify-center items-center gap-3">
                <motion.button
                  onClick={() => {
                    setMobileStep((prev) => (prev - 1 + mobileDemoSteps.length) % mobileDemoSteps.length);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-light-gray text-dark-gray hover:bg-dark-gray hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <div className="text-center min-w-[140px]">
                  <p className="font-semibold text-foreground text-sm">{mobileDemoSteps[mobileStep].title}</p>
                  <p className="text-xs text-foreground-muted">{mobileStep + 1} of {mobileDemoSteps.length}</p>
                </div>
                <motion.button
                  onClick={() => {
                    setMobileStep((prev) => (prev + 1) % mobileDemoSteps.length);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-light-gray text-dark-gray hover:bg-dark-gray hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Description */}
              <div className="bg-light-gray/30 rounded-lg p-4 border border-light-gray text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {mobileDemoSteps[mobileStep].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
