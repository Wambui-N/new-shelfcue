"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Plus,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Mock data for dashboard stats
  const stats = [
    {
      title: "Total Forms",
      value: "12",
      change: "+2 this month",
      icon: <FileText className="w-8 h-8" />,
      color: "text-blue-600"
    },
    {
      title: "Total Leads",
      value: "1,247",
      change: "+18% from last month",
      icon: <Users className="w-8 h-8" />,
      color: "text-green-600"
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.5% from last month",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "text-purple-600"
    },
    {
      title: "This Month",
      value: "89",
      change: "Active leads",
      icon: <Activity className="w-8 h-8" />,
      color: "text-orange-600"
    }
  ]

  const recentForms = [
    { name: "Newsletter Signup", leads: 45, status: "Active" },
    { name: "Contact Form", leads: 23, status: "Active" },
    { name: "Demo Request", leads: 12, status: "Active" },
    { name: "Feedback Survey", leads: 9, status: "Draft" }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your forms today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/forms/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Form
            </Button>
          </Link>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} opacity-20`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Forms and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Forms */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Forms</h3>
            <Link href="/dashboard/forms">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentForms.map((form, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{form.name}</p>
                  <p className="text-sm text-muted-foreground">{form.leads} leads</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  form.status === 'Active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {form.status}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/dashboard/forms/new">
              <Button variant="outline" className="w-full justify-start border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Plus className="w-4 h-4 mr-3" />
                Create New Form
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-start border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <BarChart3 className="w-4 h-4 mr-3" />
                View Analytics
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Settings className="w-4 h-4 mr-3" />
                Account Settings
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-background-secondary rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-foreground">New lead received from Newsletter Signup</p>
              <p className="text-xs text-muted-foreground">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-background-secondary rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-foreground">Form "Contact Form" updated</p>
              <p className="text-xs text-muted-foreground">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-background-secondary rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-foreground">Monthly analytics report generated</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
