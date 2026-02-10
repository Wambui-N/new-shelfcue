# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your ShelfCue Next.js application. The integration includes:

- **Client-side initialization** via `instrumentation-client.ts` using the PostHog JavaScript SDK
- **Server-side tracking** via `posthog-node` in API routes and webhooks
- **Reverse proxy configuration** in `next.config.ts` for ad-blocker resilience
- **Event tracking** added to key user flows including signups, form creation, and CTA interactions

## Events Implemented

| Event Name | Description | File Path |
|------------|-------------|-----------|
| `hero_cta_clicked` | User clicked the primary CTA button in the hero section | `src/components/sections/HeroSection.tsx` |
| `demo_video_played` | User clicked to watch the demo video | `src/components/sections/HeroSection.tsx` |
| `final_cta_clicked` | User clicked the final CTA to start free trial | `src/components/sections/FinalCTASection.tsx` |
| `google_signin_started` | User initiated Google sign-in | `src/app/auth/signin/page.tsx` |
| `google_signup_started` | User initiated Google sign-up | `src/app/auth/signup/page.tsx` |
| `form_submitted_public` | End-user submitted a public form (client-side) | `src/components/forms/FormContent.tsx` |
| `form_step_completed` | User completed a step in a conversational form | `src/components/forms/FormContent.tsx` |
| `dashboard_viewed` | User viewed their dashboard | `src/app/dashboard/page.tsx` |
| `form_link_copied` | User copied a form link or embed code | `src/components/builder/ShareDialog.tsx` |

### Pre-existing Events (already in codebase)

| Event Name | Description | Location |
|------------|-------------|----------|
| `user_signed_in` | User completed sign-in | `src/contexts/AuthContext.tsx` |
| `user_signed_out` | User logged out | `src/contexts/AuthContext.tsx` |
| `user_signed_up` | User completed sign-up | `src/contexts/AuthContext.tsx` |
| `pricing_cta_clicked` | User clicked pricing CTA | Various components |
| `form_editor_opened` | User opened the form editor | Editor components |
| `google_connected` | User connected Google account | Auth flow |
| `payment_initiated` | User started payment process | `src/app/api/payments/initialize/route.ts` |
| `trial_started` | User started trial | Server-side |
| `subscription_activated` | User subscription became active | `src/app/api/webhooks/paystack/route.ts` |
| `subscription_cancelled` | User cancelled subscription | `src/app/api/webhooks/paystack/route.ts` |
| `form_submission_received` | Form submission received (server-side) | `src/app/api/forms/publish/route.ts` |
| `form_created` | User created a new form | Server-side |
| `form_published` | User published a form | `src/app/api/forms/publish/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- **Analytics basics**: [https://eu.posthog.com/project/124842/dashboard/518764](https://eu.posthog.com/project/124842/dashboard/518764)

### Insights
1. **Signup Conversion Funnel**: [https://eu.posthog.com/project/124842/insights/oJGju25O](https://eu.posthog.com/project/124842/insights/oJGju25O)
2. **Daily User Activity**: [https://eu.posthog.com/project/124842/insights/vpuh9nZL](https://eu.posthog.com/project/124842/insights/vpuh9nZL)
3. **Form Submissions Trend**: [https://eu.posthog.com/project/124842/insights/2BhyseY8](https://eu.posthog.com/project/124842/insights/2BhyseY8)
4. **Trial to Subscription Funnel**: [https://eu.posthog.com/project/124842/insights/Yz3JoIUx](https://eu.posthog.com/project/124842/insights/Yz3JoIUx)
5. **CTA Click Performance**: [https://eu.posthog.com/project/124842/insights/rpFczNzZ](https://eu.posthog.com/project/124842/insights/rpFczNzZ)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

## Configuration Files

- **Environment Variables**: Already configured in `.env.local`:
  - `NEXT_PUBLIC_POSTHOG_KEY`: Your PostHog API key
  - `NEXT_PUBLIC_POSTHOG_HOST`: `https://eu.i.posthog.com`

- **Client Initialization**: `instrumentation-client.ts`
- **Server Client**: `src/lib/posthog-server.ts`
- **Reverse Proxy**: Configured in `next.config.ts` with `/ingest` rewrites
