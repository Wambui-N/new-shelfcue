import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FullPageLoader({
  label = "Hang tight, we’re loading your workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-16 h-72 w-72 md:h-96 md:w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 md:h-[420px] md:w-[420px] rounded-full bg-accent/10 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="rounded-3xl border border-border/80 bg-card/95 shadow-2xl shadow-primary/10 px-8 py-10 text-center space-y-6 backdrop-blur">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-muted opacity-30" />
            <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-primary animate-spin" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              ShelfCue
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              Preparing your workspace
            </h2>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <img
              src="/1.png"
              alt="ShelfCue Logo"
              className="h-4 w-auto opacity-70"
            />
            <span>Crafting premium form experience</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicFormSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="relative w-full md:w-2/5 lg:w-[42%] h-[260px] md:h-auto overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_50%),linear-gradient(135deg,var(--primary)_0%,var(--accent)_80%)] animate-pulse" />
          <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[conic-gradient(from_90deg_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
          <div className="relative z-10 h-full w-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white">
            <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-24 sm:w-32 rounded-full bg-white/40" />
              <Skeleton className="h-6 w-12 rounded-full bg-white/30" />
            </div>
            <div className="space-y-3 max-w-md">
              <Skeleton className="h-5 w-40 bg-white/60" />
              <Skeleton className="h-4 w-48 bg-white/50" />
              <Skeleton className="h-4 w-32 bg-white/40" />
            </div>
          </div>
        </div>
        <div className="flex-1 bg-card/40">
          <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12">
            <div className="w-full max-w-2xl">
              <div className="bg-card rounded-3xl border shadow-xl shadow-primary/5 p-5 sm:p-8 md:p-10 space-y-6">
                <div className="space-y-3 text-center md:text-left">
                  <Skeleton className="h-4 w-24 mx-auto md:mx-0 rounded-full" />
                  <Skeleton className="h-8 w-3/4 md:w-2/3 mx-auto md:mx-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-5">
                  {[1, 2, 3].map((field) => (
                    <div key={field} className="space-y-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                  ))}
                  <Skeleton className="h-4 w-44" />
                </div>
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border text-muted-foreground text-xs">
                <img
                  src="/1.png"
                  alt="ShelfCue Logo"
                  className="h-4 w-auto opacity-70"
                />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntegrationPanelSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((panel) => (
        <Card key={panel} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full ml-auto" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CalendarListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border border-border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      ))}
    </div>
  );
}
