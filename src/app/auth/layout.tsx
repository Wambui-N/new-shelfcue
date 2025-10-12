import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-background rounded-full"></div>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {subtitle}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            You acknowledge that you read, and agree, to our{" "}
            <Link href="/terms" className="text-muted-foreground hover:text-foreground underline">
              Terms of Service
            </Link>{" "}
            and our{" "}
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}