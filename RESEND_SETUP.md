# Resend Email Integration Setup Guide

This guide will help you set up Resend for email notifications in your ShelfCue application.

## Overview

ShelfCue uses [Resend](https://resend.com) for transactional emails. The application sends the following email notifications:

1. **Welcome Email** - Sent when a new user signs up
2. **Form Submission Notification** - Sent to form owners when someone submits their form
3. **Subscription Confirmation** - Sent when a user subscribes to a plan
4. **Payment Failed Notification** - Sent when a payment fails
5. **Invoice Notification** - Sent when a new invoice is created
6. **Subscription Cancelled** - Sent when a subscription is cancelled

## Prerequisites

1. A Resend account ([Sign up here](https://resend.com/signup))
2. A verified domain (or use Resend's test domain for development)

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com/signup](https://resend.com/signup)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Name it (e.g., "ShelfCue Production")
5. Copy the API key (it will only be shown once!)

### 3. Verify Your Domain (Production)

For production use, you need to verify your domain:

1. In the Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `shelfcue.com`)
4. Add the provided DNS records to your domain registrar:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
5. Wait for verification (usually takes a few minutes)

### 4. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL="ShelfCue <noreply@shelfcue.com>"

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://shelfcue.com
```

**Important Notes:**
- Replace `re_your_api_key_here` with your actual Resend API key
- For development, you can use `onboarding@resend.dev` as the sender email
- For production, use your verified domain email address
- The `NEXT_PUBLIC_APP_URL` should match your production URL

### 5. Development Testing

For development and testing, Resend provides a test email address:

```bash
RESEND_FROM_EMAIL="ShelfCue <onboarding@resend.dev>"
```

With this setup, you can send test emails without verifying a domain.

## Email Templates

All email templates are defined in `src/lib/resend.ts`. The templates are responsive and styled to match your brand.

### Customizing Email Templates

To customize the email templates:

1. Open `src/lib/resend.ts`
2. Find the template method you want to modify (e.g., `getWelcomeEmailHtml`)
3. Update the HTML content and styles
4. Test your changes by triggering the relevant action

### Email Template Variables

Each email type supports specific variables:

**Welcome Email:**
- `userName` - User's name

**Form Submission:**
- `formName` - Name of the form
- `submittedAt` - Timestamp of submission
- `submitterData` - Form field values

**Subscription Confirmation:**
- `userName` - User's name
- `planName` - Name of the subscription plan
- `amount` - Subscription amount
- `billingCycle` - Monthly/Annual

**Payment Failed:**
- `userName` - User's name
- `amount` - Failed payment amount
- `reason` - Failure reason (optional)

**Invoice:**
- `userName` - User's name
- `invoiceNumber` - Invoice number
- `amount` - Invoice amount
- `dueDate` - Payment due date
- `invoiceUrl` - Link to invoice (optional)

**Subscription Cancelled:**
- `userName` - User's name
- `planName` - Name of the cancelled plan
- `endDate` - When access ends

## Integration Points

### 1. Form Submissions (`src/app/api/submit/route.ts`)

Emails are sent automatically when a form is submitted. The form owner receives:
- Submission details
- All form field values
- Link to view all submissions

### 2. Subscription Events (`src/app/api/webhooks/paystack/route.ts`)

Emails are sent for these Paystack webhook events:
- `subscription.create` - Subscription confirmation
- `subscription.disable` - Cancellation notification
- `invoice.create` - New invoice
- `invoice.payment_failed` - Payment failure

### 3. User Signup (`src/app/auth/welcome/page.tsx`)

Welcome emails are sent when users:
- Complete signup and reach the welcome page
- Email is sent asynchronously (non-blocking)

## Testing

### Test Welcome Email

1. Create a new account at `/auth/signup`
2. Check the recipient's inbox

### Test Form Submission Email

1. Create and publish a form
2. Submit the form
3. Check the form owner's inbox

### Test Subscription Emails

Use Paystack's test mode and webhook testing to trigger subscription events.

## Monitoring

### View Email Logs

1. Log in to your Resend dashboard
2. Navigate to **Logs**
3. View all sent emails, delivery status, and any errors

### Handle Errors

Email sending is implemented with graceful error handling:
- Errors are logged to the console
- Email failures don't block user actions
- Form submissions succeed even if email fails

## Rate Limits

Resend free tier includes:
- 100 emails per day
- 3,000 emails per month

For higher volumes, check Resend's [pricing page](https://resend.com/pricing).

## Production Checklist

Before going to production:

- [ ] Verify your domain in Resend
- [ ] Update `RESEND_FROM_EMAIL` with your verified domain email
- [ ] Set proper `NEXT_PUBLIC_APP_URL` for your production domain
- [ ] Test all email types in staging environment
- [ ] Set up Resend webhook (optional) for delivery tracking
- [ ] Configure DNS records (SPF, DKIM, DMARC)
- [ ] Monitor email delivery rates in Resend dashboard

## Support

For issues or questions:
- **Resend Documentation:** [resend.com/docs](https://resend.com/docs)
- **Resend Support:** [resend.com/support](https://resend.com/support)
- **Code Issues:** Check `src/lib/resend.ts` for implementation details

## Best Practices

1. **Use transactional emails only** - Don't send marketing emails through this integration
2. **Keep emails concise** - Users appreciate brief, actionable emails
3. **Test thoroughly** - Test all email types before deploying
4. **Monitor deliverability** - Check your Resend logs regularly
5. **Handle unsubscribes** - Add unsubscribe options for non-critical emails
6. **Personalize** - Use user names and relevant details
7. **Mobile-friendly** - All templates are responsive by default

## Troubleshooting

### Emails Not Sending

1. Check your Resend API key is correct in `.env.local`
2. Verify the sender email matches your verified domain
3. Check Resend logs for error messages
4. Ensure environment variables are loaded (restart dev server)

### Emails Going to Spam

1. Verify your domain properly
2. Set up DMARC record
3. Avoid spam trigger words
4. Keep a good sender reputation

### Wrong From Address

1. Update `RESEND_FROM_EMAIL` in `.env.local`
2. Ensure the domain is verified in Resend
3. Restart your application server

## Advanced Configuration

### Custom Email Service Methods

To add a new email type:

1. Add a new static method to `EmailService` class in `src/lib/resend.ts`
2. Create the HTML template method (e.g., `getCustomEmailHtml`)
3. Call the method from your API route or component

Example:

```typescript
static async sendCustomEmail(
  recipientEmail: string,
  { userName, customData }: { userName: string; customData: string }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: recipientEmail,
      subject: "Custom Email Subject",
      html: this.getCustomEmailHtml({ userName, customData }),
    });

    if (error) {
      console.error("Error sending custom email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending custom email:", error);
    return { success: false, error };
  }
}
```

### Using React Email Components

For more advanced templates, you can use React Email components:

1. Create a new file in `src/emails/` (e.g., `welcome.tsx`)
2. Import and use `@react-email/components`
3. Update the email service to render React components

Example:

```typescript
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/welcome";

const html = render(WelcomeEmail({ userName: "John" }));
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | Yes | Your Resend API key | `re_123abc...` |
| `RESEND_FROM_EMAIL` | No | Sender email address | `ShelfCue <noreply@shelfcue.com>` |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL for email links | `https://shelfcue.com` |

---

**Last Updated:** October 2025

