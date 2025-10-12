"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { GoogleConnectPrompt } from '@/components/GoogleConnectPrompt'
import { supabase } from '@/lib/supabase'

export default function WelcomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Check if Google is already connected
    const checkGoogleConnection = async () => {
      try {
        const { data } = await supabase
          .from('user_google_tokens')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (data) {
          // Already connected, go to dashboard
          router.push('/dashboard')
        } else {
          setChecking(false)
        }
      } catch (error) {
        setChecking(false)
      }
    }

    checkGoogleConnection()
  }, [user, router])

  const handleConnect = () => {
    // Redirect to Google OAuth with return URL
    const returnUrl = encodeURIComponent('/dashboard')
    window.location.href = `/api/auth/google?returnUrl=${returnUrl}`
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleConnectPrompt 
      onConnect={handleConnect}
      onSkip={handleSkip}
    />
  )
}

