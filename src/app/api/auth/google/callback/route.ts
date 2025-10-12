import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('🔵 Google OAuth callback started')
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') || '/dashboard'
    const error = searchParams.get('error')

    console.log('🔵 Callback params:', { code: code ? 'present' : 'missing', state, error })

    if (error) {
      console.error('❌ OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', request.url))
    }

    if (!code) {
      console.error('❌ No authorization code received')
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

    console.log('Google user info:', userInfo)

    if (!userInfo?.email) {
      console.error('No email in Google user info')
      return NextResponse.redirect(new URL('/dashboard?error=no_google_email', request.url))
    }

    // Create Supabase client for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find user by email using auth admin API
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.redirect(new URL('/auth/signin?error=auth_error', request.url))
    }

    const user = authUsers.users.find(u => u.email === userInfo.email)
    
    if (!user) {
      console.error('User not found in Supabase auth:', userInfo.email)
      return NextResponse.redirect(new URL('/auth/signin?error=user_not_found', request.url))
    }

    const userId = user.id
    console.log('Found Supabase user ID:', userId)

    // Store Google tokens in database using service role
    // Convert expiry_date to proper timestamp (Google returns milliseconds, PostgreSQL expects seconds)
    const expiresAt = tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : Math.floor((Date.now() + 3600 * 1000) / 1000)
    
    console.log('🔵 Token expiry info:', {
      original: tokens.expiry_date,
      converted: expiresAt,
      currentTime: Math.floor(Date.now() / 1000)
    })
    
    const { error: dbError } = await supabase.from('user_google_tokens').upsert({
      user_id: userId,
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token || '',
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })

    if (dbError) {
      console.error('Error storing Google tokens:', dbError)
      return NextResponse.redirect(new URL('/dashboard?error=token_storage_failed', request.url))
    }

    console.log('✅ Google tokens stored for user:', userId)

    // Redirect to return URL
    console.log('🔄 Redirecting to:', state)
    return NextResponse.redirect(new URL(state, request.url))
  } catch (error: any) {
    console.error('❌ Error in Google OAuth callback:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.redirect(
      new URL('/dashboard?error=google_callback_failed', request.url)
    )
  }
}

