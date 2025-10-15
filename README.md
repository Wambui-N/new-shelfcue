This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ShelfCue - Smart Form Builder with Google Integrations

A powerful form builder with seamless Google Calendar and Sheets integration, subscription management, and automated email notifications.

## Features

- 📝 **Intuitive Form Builder** - Create beautiful forms with drag-and-drop
- 📅 **Google Calendar Integration** - Automatic meeting scheduling from form submissions
- 📊 **Google Sheets Sync** - Real-time form data synchronization
- 💳 **Subscription Management** - Powered by Paystack
- 📧 **Email Notifications** - Automated transactional emails via Resend
- 📱 **Responsive Design** - Works perfectly on all devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Accounts for: Supabase, Google Cloud, Paystack, and Resend

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shelf-cue
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the template and fill in your values
cp ENV_TEMPLATE.md .env.local
```

See `ENV_TEMPLATE.md` for all required environment variables.

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Email Notifications Setup

ShelfCue uses Resend for transactional email notifications. To set up email functionality:

1. Sign up for a [Resend account](https://resend.com/signup)
2. Get your API key from the Resend dashboard
3. Add `RESEND_API_KEY` to your `.env.local` file
4. See `RESEND_SETUP.md` for detailed configuration

**Email notifications include:**
- Welcome emails for new users
- Form submission notifications
- Subscription confirmations
- Payment failure alerts
- Invoice notifications

## Project Structure

```
src/
├── app/                      # Next.js app router pages
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── forms/           # Form management
│   │   ├── submit/          # Form submission handler
│   │   └── webhooks/        # Paystack webhooks
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Main dashboard
│   └── form/                # Public form pages
├── components/              # React components
│   ├── builder/            # Form builder components
│   ├── sections/           # Landing page sections
│   └── ui/                 # UI components
├── lib/                     # Utility libraries
│   ├── resend.ts           # Email service
│   ├── supabase.ts         # Supabase client
│   ├── google.ts           # Google OAuth
│   └── paystack.ts         # Payment processing
└── types/                   # TypeScript type definitions
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# new-shelfcue
