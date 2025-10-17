"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Mail,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TrialBanner } from "@/components/subscriptions/TrialBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface DashboardLayoutProps{
  children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real data from database
  const [activeFormsCount, setActiveFormsCount] = useState(0);
  const [newSubmissionsCount, setNewSubmissionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Fetch real data from database
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch active forms count (published forms)
        const { data: forms, error: formsError } = await supabase
          .from("forms")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("status", "published");

        if (!formsError) {
          setActiveFormsCount(forms?.length || 0);
        }

        // Fetch new submissions count (submissions from last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: submissions, error: submissionsError } = await supabase
          .from("submissions")
          .select("id")
          .gte("created_at", sevenDaysAgo.toISOString())
          .in("form_id", forms?.map((form) => form.id) || []);

        if (!submissionsError) {
          setNewSubmissionsCount(submissions?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user]);

  const primaryNavItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      badge: null,
    },
    {
      href: "/dashboard/forms",
      label: "Forms",
      icon: FileText,
      badge: loading
        ? "..."
        : activeFormsCount > 0
          ? activeFormsCount.toString()
          : null,
    },
    {
      href: "/dashboard/submissions",
      label: "Submissions",
      icon: Mail,
      badge: loading
        ? "..."
        : newSubmissionsCount > 0
          ? newSubmissionsCount.toString()
          : null,
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null,
    },
  ];

  const userMenuItems = [
    { href: "/dashboard/account", label: "Account Settings", icon: User },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "#", label: "Logout", icon: LogOut, action: handleSignOut },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <motion.aside
          className={`fixed inset-y-0 left-0 z-10 hidden sm:flex flex-col border-r border-border bg-background shadow-sm transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
          initial={false}
          animate={{ width: sidebarCollapsed ? 64 : 256 }}
        >
          <div className="flex h-full max-h-screen flex-col">
            {/* Logo & Toggle */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <motion.div
                  className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src="/1.png"
                    alt="ShelfCue"
                    className="w-5 h-5 object-contain"
                  />
                </motion.div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      className="text-lg font-bold text-foreground"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ShelfCue
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Primary Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-3 space-y-1">
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                    </motion.div>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <>
                          <motion.span
                            className="flex-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {item.label}
                          </motion.span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-primary/10 text-primary"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </AnimatePresence>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Lower Section */}
            <div className="border-t border-border p-3 space-y-2">
              {/* Settings */}
              <Link
                href="/dashboard/settings"
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
                  pathname === "/dashboard/settings"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
                title={sidebarCollapsed ? "Settings" : undefined}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 30 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Settings
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent w-full"
                  title={sidebarCollapsed ? "User Menu" : undefined}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                    {user?.user_metadata?.full_name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </div>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-foreground truncate text-sm">
                            {user?.user_metadata?.full_name || "User"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user?.email}
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: userMenuOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </button>

                <AnimatePresence>
                  {!sidebarCollapsed && userMenuOpen && (
                    <motion.div
                      className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-lg py-1 z-50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {userMenuItems.map((item) => (
                        <motion.button
                          key={item.label}
                          onClick={() => {
                            if (item.action) {
                              item.action();
                            } else {
                              router.push(item.href);
                            }
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div
          className={`flex flex-col flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "sm:pl-16" : "sm:pl-64"
          }`}
        >
          {/* Mobile Header */}
          <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 sm:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/sc-logo.png" alt="ShelfCue" className="w-6 h-6" />
              <span className="text-sm font-bold text-foreground">
                ShelfCue
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="fixed inset-0 z-40 bg-background sm:hidden"
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col h-full p-4">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-lg font-bold text-foreground">
                      Menu
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <nav className="space-y-2 flex-1">
                    {primaryNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t border-border pt-4 space-y-2">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trial Banner */}
          <TrialBanner />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
