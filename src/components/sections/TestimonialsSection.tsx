"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TestimonialsSection() {
  const testimonial = {
    quote:
      "I had my first form capturing leads in under 2 minutes. Previously I'd waste hours setting up complex forms. Shelfcue just works!",
    author: "Sarah K.",
    role: "Marketing Consultant",
    rating: 5,
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background/50 to-background">
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            Join{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              1,000+ Founders
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Who Stopped Losing Leads
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -8 }}
          className="relative"
        >
          <Card className="relative p-6 border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 group hover:shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
            {/* Decorative Background */}
            <motion.div
              className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Quote Icon */}
            <motion.div
              className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg opacity-90"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Quote className="w-6 h-6 text-white" fill="white" />
            </motion.div>

            <div className="relative z-10 pt-6">
              {/* Rating Stars */}
              <motion.div
                className="flex justify-center gap-1 mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: 0.4 + i * 0.1,
                      type: "spring",
                    }}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                  >
                    <Star
                      className="w-4 h-4 text-yellow-500 fill-yellow-500"
                      fill="currentColor"
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Quote */}
              <motion.blockquote
                className="text-lg md:text-xl text-foreground font-medium text-center mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                "{testimonial.quote}"
              </motion.blockquote>

              {/* Author */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="inline-block">
                  <p className="text-base font-bold text-foreground mb-1">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Decorative Corner */}
            <motion.div
              className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              initial={false}
            />
          </Card>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-6 px-6 py-3 bg-primary/5 border border-primary/20 rounded-xl backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <p className="text-2xl font-bold text-foreground">1,000+</p>
              <p className="text-xs text-muted-foreground">Happy Users</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-bold text-foreground">50,000+</p>
              <p className="text-xs text-muted-foreground">Leads Captured</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-bold text-foreground">47%</p>
              <p className="text-xs text-muted-foreground">More Conversions</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

