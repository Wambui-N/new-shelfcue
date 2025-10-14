"use client";

import { Crown, X, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UpgradePromptProps {
  message: string;
  feature?: string;
  dismissible?: boolean;
  variant?: "banner" | "card" | "inline";
}

export function UpgradePrompt({
  message,
  feature,
  dismissible = false,
  variant = "card",
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 rounded-lg mb-6 relative">
        {dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6" />
          <div className="flex-1">
            <p className="font-semibold">{message}</p>
            {feature && (
              <p className="text-sm opacity-90 mt-1">
                Unlock {feature} with a Professional plan
              </p>
            )}
          </div>
          <Button
            asChild
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/dashboard/billing">Upgrade Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="w-4 h-4 text-primary" />
        <span>{message}</span>
        <Link
          href="/dashboard/billing"
          className="text-primary hover:underline font-medium"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Upgrade to Professional
          </h3>
          <p className="text-muted-foreground mb-4">{message}</p>
          {feature && (
            <p className="text-sm text-muted-foreground mb-4">
              Get access to {feature} and more premium features.
            </p>
          )}
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
          >
            <Link href="/dashboard/billing">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Link>
          </Button>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-muted rounded"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
