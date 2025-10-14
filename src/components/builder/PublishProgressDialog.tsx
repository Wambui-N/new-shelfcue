"use client"

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader2, Sparkles, Sheet, Calendar } from 'lucide-react'

interface PublishProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  steps: {
    saving?: 'pending' | 'loading' | 'completed' | 'error'
    sheet?: 'pending' | 'loading' | 'completed' | 'error'
    meeting?: 'pending' | 'loading' | 'completed' | 'error'
  }
}

interface StepConfig {
  key: string
  icon: React.ReactNode
  label: string
  description: string
}

export function PublishProgressDialog({
  open,
  onOpenChange,
  steps
}: PublishProgressDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const stepConfigs: StepConfig[] = [
    {
      key: 'saving',
      icon: <Sparkles className="w-5 h-5" />,
      label: 'Saving Form',
      description: 'Securing your form data...'
    },
    {
      key: 'sheet',
      icon: <Sheet className="w-5 h-5" />,
      label: 'Creating Google Sheet',
      description: 'Setting up automatic data sync...'
    },
    ...(steps.meeting ? [{
      key: 'meeting',
      icon: <Calendar className="w-5 h-5" />,
      label: 'Configuring Calendar',
      description: 'Setting up meeting bookings...'
    }] : [])
  ]

  // Auto-update current step based on progress
  useEffect(() => {
    const activeSteps = stepConfigs.filter(config => steps[config.key as keyof typeof steps])
    const loadingIndex = activeSteps.findIndex(config => 
      steps[config.key as keyof typeof steps] === 'loading'
    )
    const completedCount = activeSteps.filter(config => 
      steps[config.key as keyof typeof steps] === 'completed'
    ).length

    if (loadingIndex !== -1) {
      setCurrentStep(loadingIndex)
    } else if (completedCount === activeSteps.length && completedCount > 0) {
      setCurrentStep(activeSteps.length) // All done
    }
  }, [steps, stepConfigs])

  const getStepStatus = (stepKey: string) => {
    return steps[stepKey as keyof typeof steps] || 'pending'
  }

  const allCompleted = stepConfigs
    .filter(config => steps[config.key as keyof typeof steps])
    .every(config => steps[config.key as keyof typeof steps] === 'completed')

  return (
    <Dialog open={open} onOpenChange={(open) => {
      // Prevent closing the dialog while publishing is in progress
      const isPublishing = Object.values(steps).some(status => status === 'loading')
      if (!isPublishing) {
        onOpenChange(open)
      }
    }}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="sr-only">
            {allCompleted ? 'Publishing Complete' : 'Publishing Form'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {allCompleted 
              ? 'Your form has been published successfully' 
              : 'Please wait while we publish your form and set up integrations'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                {allCompleted ? (
                  <motion.div
                    key="completed"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold"
            >
              {allCompleted ? 'Published Successfully! 🎉' : 'Publishing Form...'}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground mt-2"
            >
              {allCompleted 
                ? 'Your form is now live and ready to collect responses' 
                : 'Please wait while we set up your form'
              }
            </motion.p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {stepConfigs
              .filter(config => steps[config.key as keyof typeof steps])
              .map((config, index) => {
                const status = getStepStatus(config.key)
                const isCompleted = status === 'completed'
                const isLoading = status === 'loading'
                const isError = status === 'error'

                return (
                  <motion.div
                    key={config.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-start gap-4 p-4 rounded-lg border transition-all ${
                      isCompleted 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                        : isLoading
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                        : isError
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    {/* Step Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isLoading
                        ? 'bg-blue-500 text-white'
                        : isError
                        ? 'bg-red-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </motion.div>
                      ) : isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        config.icon
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${
                        isCompleted ? 'text-green-700 dark:text-green-300' : ''
                      }`}>
                        {config.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {isCompleted 
                          ? '✓ Completed' 
                          : isLoading 
                          ? config.description 
                          : 'Waiting...'
                        }
                      </p>
                    </div>

                    {/* Loading Dots Animation */}
                    {isLoading && (
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
          </div>

          {/* Success Message */}
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <p className="text-sm text-green-700 dark:text-green-300 text-center">
                🚀 Redirecting to your published form...
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

