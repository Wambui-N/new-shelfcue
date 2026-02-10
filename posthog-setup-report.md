# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into your ShelfCue Next.js application. The integration includes:

- **Client-side initialization** via `instrumentation-client.ts` (Next.js 15.3+ recommended approach)
- **Server-side tracking** via `posthog-node` for API route events
- **User identification** that ties anonymous users to their authenticated identity
- **Reverse proxy configuration** in `next.config.ts` to avoid ad blockers
- **Environment variables** configured in `.env.local`

## Events Implemented

| Event Name | Description | File Location |
|------------|-------------|---------------|
| `user_signed_up` | User completes signup flow via Google OAuth | `src/app/auth/callback/page.tsx` |
| `user_signed_in` | User signs in successfully | `src/contexts/AuthContext.tsx`, `src/app/auth/callback/page.tsx` |
| `user_signed_out` | User signs out | `src/contexts/AuthContext.tsx` |
| `form_created` | User creates a new form | `src/app/api/forms/[formId]/route.ts` |
| `form_published` | User publishes a form | `src/app/api/forms/publish/route.ts` |
| `form_submission_received` | Form receives a submission (server-side) | `src/app/api/submit/route.ts` |
| `form_editor_opened` | User opens the form editor | `src/app/editor/[formId]/page.tsx` |
| `trial_started` | User starts their 14-day free trial (server-side) | `src/app/api/subscriptions/create-trial/route.ts` |
| `payment_initiated` | User initiates payment checkout (server-side) | `src/app/api/payments/initialize/route.ts` |
| `subscription_activated` | Payment successful and subscription active (webhook) | `src/app/api/webhooks/paystack/route.ts` |
| `subscription_cancelled` | User cancels subscription (webhook) | `src/app/api/webhooks/paystack/route.ts` |
| `google_connected` | User connects Google account (server-side) | `src/app/api/auth/store-google-tokens/route.ts` |
| `pricing_cta_clicked` | User clicks CTA on pricing section | `src/components/sections/PricingSection.tsx` |

## Files Created/Modified

### New Files
- `instrumentation-client.ts` - Client-side PostHog initialization
- `src/lib/posthog-server.ts` - Server-side PostHog client utility

### Modified Files
- `next.config.ts` - Added PostHog reverse proxy rewrites
- `.env.local` - Added PostHog environment variables
- `src/contexts/AuthContext.tsx` - Added identify/capture for auth events
- `src/app/auth/callback/page.tsx` - Added signup and login tracking
- `src/app/api/submit/route.ts` - Added form submission tracking
- `src/app/api/subscriptions/create-trial/route.ts` - Added trial tracking
- `src/app/api/payments/initialize/route.ts` - Added payment tracking
- `src/app/api/webhooks/paystack/route.ts` - Added subscription lifecycle tracking
- `src/app/api/forms/publish/route.ts` - Added form publish tracking
- `src/app/api/forms/[formId]/route.ts` - Added form creation tracking
- `src/app/api/auth/store-google-tokens/route.ts` - Added Google connection tracking
- `src/components/sections/PricingSection.tsx` - Added pricing CTA tracking
- `src/app/editor/[formId]/page.tsx` - Added editor open tracking

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://eu.posthog.com/project/124842/dashboard/517760) - Core analytics dashboard with key metrics

### Insights
- [User Signups Over Time](https://eu.posthog.com/project/124842/insights/Zv08wW0r) - Daily signups trend
- [Activation Funnel](https://eu.posthog.com/project/124842/insights/O4CllDtJ) - Signup → Form Created → Form Published conversion
- [Trial to Paid Conversion](https://eu.posthog.com/project/124842/insights/cB2EGGXx) - Trial → Payment → Subscription funnel
- [Form Submissions Over Time](https://eu.posthog.com/project/124842/insights/s0bImGZx) - Daily form submissions (core value metric)
- [Subscription Health](https://eu.posthog.com/project/124842/insights/wS5NDq12) - Weekly activations vs cancellations (churn monitoring)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
