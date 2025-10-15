"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  // Track scroll position for navigation styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation items
  const navigationItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQs", href: "#faq" },
  ];

  // Handle smooth scrolling for anchor links
  const handleNavClick = (href: string, e?: React.MouseEvent) => {
    if (href.startsWith("#")) {
      e?.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 relative">
                <img
                  src="/1.png"
                  alt="ShelfCue Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                ShelfCue
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={(e) => handleNavClick(item.href, e)}
                  className="relative text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer group"
                >
                  {item.name}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Auth Button */}
          <div className="hidden sm:block">
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-black text-white hover:bg-dark-gray transition-colors duration-300 text-sm px-4 py-2">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button className="bg-black text-white hover:bg-dark-gray transition-colors duration-300 text-sm px-4 py-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground relative"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/95 backdrop-blur-lg border-t border-border">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={(e) => {
                      handleNavClick(item.href, e);
                      setIsMenuOpen(false);
                    }}
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200"
                  >
                    {item.name}
                  </button>
                ))}

                {/* Mobile Auth Button */}
                <div className="px-3 py-2">
                  {user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button className="w-full bg-black text-white hover:bg-dark-gray transition-colors duration-300">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button className="w-full bg-black text-white hover:bg-dark-gray transition-colors duration-300">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
