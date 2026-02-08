import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md min-w-0 mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Image
              src="/1.png"
              alt="ShelfCue Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl sm:text-2xl font-bold text-foreground">ShelfCue</span>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-8 shadow-sm">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            You acknowledge that you read, and agree, to our{" "}
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground underline"
            >
              Terms and Conditions
            </Link>{" "}
            and our{" "}
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
