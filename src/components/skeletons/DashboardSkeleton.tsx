import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
        <Skeleton className="h-8 sm:h-10 w-60 sm:w-80 mb-2 sm:mb-3 bg-primary-foreground/20" />
        <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 bg-primary-foreground/20" />

        {/* Stats Cards Inside Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary-foreground/20"
            >
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-xl mb-3 sm:mb-4 bg-primary-foreground/30" />
              <Skeleton className="h-8 sm:h-10 w-16 sm:w-20 mb-2 bg-primary-foreground/30" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 bg-primary-foreground/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8">
        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-sm">
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-40 mb-4 sm:mb-6" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl hover:bg-accent/30 transition-colors"
                >
                  <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-3 sm:h-4 w-28 sm:w-32 mb-2" />
                    <Skeleton className="h-3 w-36 sm:w-48 mb-1" />
                    <Skeleton className="h-2 sm:h-3 w-20 sm:w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Your Forms */}
        <div className="xl:col-span-3">
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
              <Skeleton className="h-9 sm:h-10 w-full sm:w-36 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-xl hover:shadow-md transition-all"
                >
                  <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 sm:h-5 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4 mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 sm:h-5 w-14 sm:w-16 rounded-full" />
                      <div className="flex gap-1">
                        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
                        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormsListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-72 sm:w-96" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-10 w-32 sm:w-36 rounded-lg" />
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-28 rounded-lg" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <Skeleton className="h-10 sm:h-11 flex-1 max-w-md rounded-xl" />
        <Skeleton className="h-10 sm:h-11 w-28 sm:w-32 rounded-xl" />
        <Skeleton className="h-10 sm:h-11 w-32 sm:w-36 rounded-xl" />
      </div>

      {/* Select All */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
        <Skeleton className="h-3 sm:h-4 w-36 sm:w-40" />
      </div>

      {/* Forms Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 sm:p-5 border hover:shadow-xl transition-all h-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
              <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 sm:h-6 w-full mb-2" />
            <Skeleton className="h-3 sm:h-4 w-4/5 mb-3 sm:mb-4" />
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
            </div>
            <div className="flex items-center justify-between pt-3 sm:pt-4 mt-auto border-t">
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
                <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubmissionsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-72 sm:w-96" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-10 w-full sm:w-auto flex-1 sm:flex-none rounded-lg" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-xl border shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 justify-between">
          <Skeleton className="h-8 sm:h-10 w-32 rounded-lg" />
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-9 sm:h-10 flex-1 sm:w-64 rounded-lg" />
            <Skeleton className="h-9 sm:h-10 w-full sm:w-32 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Submissions Cards/List */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b flex items-center justify-between">
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          <Skeleton className="h-9 sm:h-10 w-28 sm:w-32 rounded-lg" />
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="p-4 sm:p-5 hover:bg-accent/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 space-y-2 w-full">
                  <Skeleton className="h-4 sm:h-5 w-48 sm:w-56" />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                  <Skeleton className="h-6 sm:h-7 w-16 sm:w-20 rounded-full" />
                  <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
                  <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-72 sm:w-96" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-10 w-32 sm:w-36 rounded-lg" />
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-28 rounded-lg" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 sm:p-6 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
            </div>
            <Skeleton className="h-8 sm:h-10 w-20 sm:w-24 mb-2" />
            <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>

      {/* Form Performance */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1">
                <Skeleton className="h-5 w-56 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div
            key={section}
            className="bg-card rounded-xl p-6 border shadow-sm"
          >
            <Skeleton className="h-6 w-40 mb-6" />
            <div className="space-y-5">
              {[1, 2, 3].map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div className="flex-1">
                    <Skeleton className="h-5 w-36 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Profile Section */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="flex items-center gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-3" />
            <Skeleton className="h-4 w-72 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="space-y-5">
          <div>
            <Skeleton className="h-5 w-28 mb-3" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-5 w-28 mb-3" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-5 w-28 mb-3" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-5">
          <div>
            <Skeleton className="h-5 w-36 mb-3" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-11 w-44 rounded-lg" />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/5 rounded-xl p-6 border border-destructive/30">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>
    </div>
  );
}

export function BillingSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 mb-2" />
        <Skeleton className="h-3 sm:h-4 w-72 sm:w-96" />
      </div>

      {/* Current Status */}
      <div className="bg-card rounded-xl border-primary p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
            <div>
              <Skeleton className="h-5 sm:h-6 w-32 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-background-secondary rounded-xl p-3 sm:p-4"
            >
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded mb-2" />
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mb-2" />
              <Skeleton className="h-3 w-20 sm:w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Plan */}
      <div className="bg-card rounded-xl p-4 sm:p-6 lg:p-8 border-2 border-primary shadow-sm">
        <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 mb-4" />
        <Skeleton className="h-10 sm:h-12 w-32 mb-3" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-md mb-6" />
        <Skeleton className="h-11 sm:h-12 w-full rounded-lg" />
      </div>

      {/* Billing History */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1">
                <Skeleton className="h-5 w-36 mb-2" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-16 rounded" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function FormEditSkeleton() {
  return (
    <div className="h-screen flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <div className="h-8 w-px bg-border" />
            <div>
              <Skeleton className="h-6 w-56 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 border-t">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-24 rounded-t-lg" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x">
          {/* Editor Panel */}
          <div className="overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-40 mb-4" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>

            {/* Field Cards */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl p-5 border-2 border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full mb-3 rounded-lg" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Field Button */}
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Preview Panel */}
          <div className="overflow-y-auto p-6 bg-muted/30">
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-2xl p-8 border-2 shadow-lg">
                <Skeleton className="h-9 w-80 mb-3" />
                <Skeleton className="h-5 w-full mb-8" />

                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="mb-6">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ))}

                <Skeleton className="h-12 w-full mt-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormViewSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Form Preview */}
      <div className="flex justify-center items-start min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-2xl p-8 border-2 shadow-lg">
            <Skeleton className="h-9 w-96 mb-3" />
            <Skeleton className="h-5 w-full mb-8" />

            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="mb-6">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}

            <Skeleton className="h-12 w-full mt-8 rounded-lg" />

            {/* Watermark skeleton */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
