"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Smartphone, Monitor, Tablet } from 'lucide-react'

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  const demoSteps = [
    {
      title: "Create Form",
      description: "Design your lead capture form in seconds",
      content: "Newsletter Signup Form"
    },
    {
      title: "Add Fields",
      description: "Drag and drop form fields with ease",
      content: "Name, Email, Company, Message"
    },
    {
      title: "Customize Design",
      description: "Match your brand colors and styling",
      content: "Modern, Clean Interface"
    },
    {
      title: "Integrate & Publish",
      description: "Connect to Google Sheets and go live",
      content: "Live Form Ready!"
    }
  ]

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const deviceSizes = {
    mobile: { width: 375, height: 667, icon: Smartphone },
    tablet: { width: 768, height: 1024, icon: Tablet },
    desktop: { width: 1200, height: 800, icon: Monitor }
  }

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            See It In Action
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Watch how easy it is to create professional lead capture forms that convert.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Controls */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Device Selector */}
            <div className="flex justify-center gap-4">
              {Object.entries(deviceSizes).map(([key, device]) => {
                const Icon = device.icon
                return (
                  <motion.button
                    key={key}
                    onClick={() => setDeviceType(key as any)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      deviceType === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.button>
                )
              })}
            </div>

            {/* Demo Steps */}
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`p-6 rounded-2xl border-2 transition-all duration-500 ${
                    currentStep === index
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/30'
                  }`}
                  animate={{
                    scale: currentStep === index ? 1.02 : 1,
                    backgroundColor: currentStep === index ? 'rgba(20, 20, 25, 0.05)' : 'transparent'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep === index
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      animate={{
                        backgroundColor: currentStep === index ? '#151419' : '#cfcecb',
                        color: currentStep === index ? '#fafafa' : '#585552'
                      }}
                    >
                      {index + 1}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                        currentStep === index ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play Demo'}
              </motion.button>
              <motion.button
                onClick={() => {
                  setCurrentStep(0)
                  setIsPlaying(false)
                }}
                className="flex items-center gap-2 px-6 py-3 border border-border text-muted-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
            </div>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Device Frame */}
            <motion.div
              className={`relative mx-auto bg-muted rounded-3xl p-4 shadow-2xl border border-border`}
              style={{
                width: deviceSizes[deviceType].width,
                height: deviceSizes[deviceType].height
              }}
              animate={{
                scale: deviceType === 'desktop' ? 0.8 : deviceType === 'tablet' ? 0.9 : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground">
                  shelfcue.com/demo
                </div>
              </div>

              {/* Demo Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {demoSteps[currentStep].icon || '📝'}
                    </motion.div>
                  </motion.div>

                  <motion.h3
                    className="text-xl font-semibold text-foreground mb-3"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {demoSteps[currentStep].title}
                  </motion.h3>

                  <motion.p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {demoSteps[currentStep].description}
                  </motion.p>

                  <motion.div
                    className="w-full max-w-sm bg-background rounded-xl p-4 border border-border shadow-sm"
                    animate={{
                      boxShadow: [
                        '0 2px 8px rgba(0,0,0,0.1)',
                        '0 4px 16px rgba(0,0,0,0.15)',
                        '0 2px 8px rgba(0,0,0,0.1)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="text-left space-y-3">
                      <div className="h-3 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                      <div className="h-10 bg-primary/20 rounded"></div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-xs">✨</span>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-xs text-primary-foreground">⚡</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
