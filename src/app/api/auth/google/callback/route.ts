import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') || '/dashboard'
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url))
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
    )

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info to verify identity
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    // Get current Supabase session
    const cookieStore = await cookies()
    const supabaseAccessToken = cookieStore.get('sb-access-token')?.value
    const supabaseRefreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!supabaseAccessToken) {
      return NextResponse.redirect(new URL('/auth/signin?error=not_authenticated', request.url))
    }

    // Get user from Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseAccessToken)

    if (userError || !user) {
      return NextResponse.redirect(new URL('/auth/signin?error=user_not_found', request.url))
    }

    // Store Google tokens in database
    await supabase.from('user_google_tokens').upsert({
      user_id: user.id,
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token || '',
      expires_at: tokens.expiry_date || Date.now() + 3600 * 1000,
      updated_at: new Date().toISOString()
    })

    console.log('✓ Google tokens stored for user:', user.id)

    // Redirect to return URL
    return NextResponse.redirect(new URL(state, request.url))
  } catch (error: any) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=google_callback_failed', request.url)
    )
  }
}

