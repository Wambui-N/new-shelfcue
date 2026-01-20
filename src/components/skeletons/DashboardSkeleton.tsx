import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent rounded-3xl p-8 shadow-xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-80 mb-3 bg-primary-foreground/20" />
          <Skeleton className="h-5 w-96 bg-primary-foreground/20" />
        </div>

        {/* Trial Period Indicator Skeleton */}
        {/* <div className="mb-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-5 w-5 rounded bg-blue-600/20" />
            <Skeleton className="h-5 w-48 bg-blue-900/20 dark:bg-blue-100/20" />
          </div>
          <Skeleton className="h-4 w-64 mb-3 bg-blue-800/20 dark:bg-blue-200/20" />
          <Skeleton className="h-9 w-28 rounded-lg bg-blue-300/20 dark:bg-blue-700/20" />
        </div> */}

        {/* Stats Cards Inside Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-primary-foreground/20 h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary-foreground/30" />
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-primary-foreground/20" />
              </div>
              <Skeleton className="h-10 sm:h-12 lg:h-14 w-16 sm:w-20 mb-1 sm:mb-2 min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem] bg-primary-foreground/30" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 bg-primary-foreground/20 mt-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Your Forms */}
        <div className="xl:col-span-4">
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
              <div>
                <Skeleton className="h-7 sm:h-8 w-32 sm:w-40 mb-1" />
                <Skeleton className="h-4 w-64 sm:w-80" />
              </div>
              <Skeleton className="h-10 w-full sm:w-auto sm:min-w-[140px] rounded-lg" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-background border border-border rounded-2xl"
                >
                  <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <Skeleton className="h-5 sm:h-6 w-48 sm:w-64" />
                      <Skeleton className="h-5 w-14 sm:w-16 rounded-full" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <Skeleton className="h-3 sm:h-4 w-32" />
                      <Skeleton className="h-3 sm:h-4 w-24" />
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                  <div className="flex sm:hidden items-center gap-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
              <div className="text-center pt-6">
                <Skeleton className="h-5 w-32 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormsListSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="h-8 sm:h-9 w-32 sm:w-40" />
            <Skeleton className="h-5 w-20 sm:w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 sm:w-36 rounded-lg" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top Row - View Toggle and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            {/* Search */}
            <Skeleton className="h-10 flex-1 max-w-md rounded-lg" />
            {/* Filter */}
            <Skeleton className="h-10 w-28 sm:w-32 rounded-lg" />
            {/* Sort */}
            <Skeleton className="h-10 w-32 sm:w-36 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Select All */}
      <div className="flex items-center gap-2 px-2 sm:px-4">
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
            {/* Checkbox and Status Badge Row */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
              <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full" />
            </div>
            {/* Form Name */}
            <Skeleton className="h-5 sm:h-6 w-full mb-2" />
            {/* Description */}
            <Skeleton className="h-3 sm:h-4 w-4/5 mb-3 sm:mb-4" />
            {/* Quick Stats */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
            </div>
            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 mt-auto border-t border-border">
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-72 sm:w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-28 rounded-lg" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-xl border shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Skeleton className="h-7 sm:h-8 w-8 sm:w-10 rounded" />
              <Skeleton className="h-7 sm:h-8 w-8 sm:w-10 rounded" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <Skeleton className="h-9 sm:h-10 flex-1 sm:w-64 rounded-lg" />
            {/* Form Filter */}
            <Skeleton className="h-9 sm:h-10 w-full sm:w-32 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <Skeleton className="h-4 w-4 rounded" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Time Range Selector */}
      <div className="bg-card rounded-xl p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex items-center space-x-1">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="space-y-1">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>

      {/* Form Performance */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 rounded mr-3" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-border rounded-xl"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Billing & Subscription */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-6 w-36 mb-1" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Profile Information */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background-secondary rounded-xl">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background-secondary rounded-xl">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div>
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card rounded-xl p-6 border shadow-sm border-destructive/50">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-96 mb-4" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillingSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <Skeleton className="h-8 sm:h-9 w-56 sm:w-64 mb-2" />
        <Skeleton className="h-3 sm:h-4 w-96" />
      </div>

      {/* Trial Banner */}
      {/* <div className="rounded-xl p-4 sm:p-6 border-2 border-primary bg-primary/5">
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
          </div>
        </div>
      </div> */}

      {/* Current Plan */}
      <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Plan Details */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-7 w-40 mb-1" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Next Billing */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
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
              className="flex items-center justify-between p-4 border rounded-lg"
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-9 sm:h-10 w-24 sm:w-32 rounded-lg" />
            <div className="h-6 sm:h-8 w-px bg-border" />
            <div>
              <Skeleton className="h-5 sm:h-6 w-40 sm:w-56 mb-1 sm:mb-2" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Skeleton className="h-9 sm:h-10 w-20 sm:w-28 rounded-lg" />
            <Skeleton className="h-9 sm:h-10 w-20 sm:w-24 rounded-lg" />
            <Skeleton className="h-9 sm:h-10 w-24 sm:w-32 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Side - Preview (Larger Width) */}
        <div className="flex-1 border-r border-border overflow-y-auto bg-gradient-to-br from-background via-background to-muted/40">
          <div className="p-0 min-h-full pb-20 lg:pb-6">
            {/* Device Toggle */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 px-3 sm:px-6 pt-3 sm:pt-6">
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Skeleton className="h-7 sm:h-8 w-20 sm:w-24 rounded" />
                <Skeleton className="h-7 sm:h-8 w-20 sm:w-24 rounded" />
              </div>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center items-start w-full overflow-hidden px-3 sm:px-6">
              <div className="w-full max-w-6xl">
                <div className="w-full rounded-3xl border border-border/60 bg-card/80 shadow-2xl overflow-hidden p-6 sm:p-8">
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

        {/* Right Side - Editor Tabs (Smaller Width) */}
        <div className="w-full lg:w-[420px] flex flex-col bg-background border-t lg:border-t-0 lg:border-l border-border">
          {/* Tab Headers */}
          <div className="flex-shrink-0 bg-background border-b border-border">
            <div className="grid grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 p-4 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>

            {/* Field Cards */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl p-5 border-2 border-border"
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
        </div>
      </div>

      {/* Mobile toggle floating button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Skeleton className="h-14 w-14 rounded-full shadow-lg" />
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
