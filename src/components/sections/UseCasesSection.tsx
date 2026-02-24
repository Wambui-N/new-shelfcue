"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  Link2,
  Linkedin,
  QrCode,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const useCases = [
  {
    icon: Linkedin,
    label: "LinkedIn",
    title: "Share on LinkedIn",
    description:
      "Post your form link directly. Ideal for client intake, lead capture, or consultation requests from your network.",
  },
  {
    icon: QrCode,
    label: "QR Code",
    title: "Print a QR code",
    description:
      "Download a print-ready QR code and place it on business cards, flyers, or at events. Clients scan and fill in seconds.",
  },
  {
    icon: Globe,
    label: "Website",
    title: "Embed on your website",
    description:
      "Drop an iframe snippet onto any page. Works with Squarespace, Wix, WordPress, or any custom site — no plugins needed.",
  },
  {
    icon: Link2,
    label: "Direct link",
    title: "Send a direct link",
    description:
      "Copy the form URL and paste it anywhere — email, WhatsApp, your email signature, or a 'Book me' button on social media.",
  },
];

const steps = [
  {
    number: "01",
    icon: CheckCircle,
    title: "Select your fields",
    description: "Pick from text, email, date, booking and more.",
  },
  {
    number: "02",
    icon: Wrench,
    title: "Add your labels",
    description:
      "Write the questions or instructions you want your clients to see.",
  },
  {
    number: "03",
    icon: Clock,
    title: "Publish in minutes",
    description:
      "Hit publish. Your form is live with a link, embed code, and QR code, no maintenance required.",
  },
];

export function UseCasesSection() {
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1 },
    }),
  };

  return (
    <section
      id="use-cases"
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary relative overflow-hidden"
    >
      {/* Decorative blur */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* ── Header ── */}
        <motion.div
          className="mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            One form. Endless ways to share it.
          </h2>
          <p className="text-base md:text-lg text-foreground-muted max-w-2xl">
            Build your form in as little as 5 minutes — select fields, add
            labels, publish. Minimal maintenance required.
          </p>
        </motion.div>

        {/* ── Use-case cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12 sm:mb-16">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.label}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="h-full p-5 sm:p-6 border border-border bg-card flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      {uc.label}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                      {uc.title}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {uc.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* ── 3-step reassurance ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-12"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-6">
            Getting started takes about 5 minutes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                      Step {step.number}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-foreground">
                    {step.title}
                  </h4>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/auth/signup">
            <Button
              size="default"
              className="bg-black text-white hover:bg-dark-gray shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-medium group"
            >
              Build your form now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
