# Testing Paystack Webhooks Locally

## Step 1: Install ngrok
```bash
npm install -g ngrok
```

## Step 2: Start your Next.js app
```bash
npm run dev
```

## Step 3: Start ngrok tunnel
```bash
ngrok http 3000
```

## Step 4: Use ngrok URL in Paystack
- Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
- In Paystack Dashboard → Settings → API Keys & Webhooks
- Set webhook URL to: `https://abc123.ngrok.io/api/webhooks/paystack`

## Step 5: Test Payment Flow
1. Go to your app at the ngrok URL
2. Try making a test payment
3. Check your terminal for webhook logs

## Step 6: Test Webhook from Paystack Dashboard
1. Go to Paystack Dashboard → Developers → Webhooks
2. Click "Test Webhook" next to your webhook URL
3. Check your terminal for the webhook event

## Expected Webhook Events

When a user subscribes, you should see these events:
1. `charge.success` - Payment successful
2. `subscription.create` - Subscription created (if using subscription plans)

## Debugging

Check your terminal for these logs:
- ✅ "Webhook signature verified"
- ✅ "Paystack webhook received: charge.success"
- ✅ "Payment recorded for user [email]"
- ✅ "Subscription activated for user [email]"
