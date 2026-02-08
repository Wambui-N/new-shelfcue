/**
 * Paystack Integration Library
 * Handles payment initialization, subscription management, and webhooks
 */

interface PaystackConfig {
  secretKey: string;
  publicKey: string;
}

interface InitializeTransactionParams {
  email: string;
  amount: number; // Amount in cents (1 Dollar = 100 cents)
  reference?: string;
  callback_url?: string;
  currency?: string; // e.g. "USD" so amount is interpreted as cents
  plan?: string; // Paystack plan code
  metadata?: Record<string, unknown>;
  channels?: string[];
}

interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      card_type: string;
      bank: string;
      channel: string;
      reusable: boolean;
    };
    customer: {
      id: number;
      customer_code: string;
      email: string;
    };
    metadata: Record<string, unknown>;
  };
}

interface CreateSubscriptionParams {
  customer: string; // Customer code or email
  plan: string; // Plan code
  authorization?: string; // Authorization code from previous transaction
  start_date?: string; // ISO 8601 format (for free trials)
}

interface CreateSubscriptionResponse {
  status: boolean;
  message: string;
  data: {
    subscription_code: string;
    email_token: string;
    amount: number;
    status: string;
    next_payment_date: string;
  };
}

interface ChargeAuthorizationParams {
  email: string;
  amount: number; // Amount in kobo
  authorization_code: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

interface ListPlansResponse {
  status: boolean;
  message: string;
  data: Array<{
    id: number;
    name: string;
    plan_code: string;
    amount: number;
    interval: string;
    currency: string;
  }>;
}

class PaystackService {
  private config: PaystackConfig;
  private baseUrl = "https://api.paystack.co";

  constructor(config: PaystackConfig) {
    this.config = config;
  }

  /**
   * Make a request to Paystack API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Paystack API request failed");
    }

    return data;
  }

  /**
   * Initialize a payment transaction
   */
  async initializeTransaction(
    params: InitializeTransactionParams,
  ): Promise<InitializeTransactionResponse> {
    return this.request<InitializeTransactionResponse>(
      "/transaction/initialize",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
  }

  /**
   * Verify a transaction using reference
   */
  async verifyTransaction(
    reference: string,
  ): Promise<VerifyTransactionResponse> {
    return this.request<VerifyTransactionResponse>(
      `/transaction/verify/${reference}`,
      {
        method: "GET",
      },
    );
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    params: CreateSubscriptionParams,
  ): Promise<CreateSubscriptionResponse> {
    return this.request<CreateSubscriptionResponse>("/subscription", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Charge an authorization (recurring payment)
   */
  async chargeAuthorization(
    params: ChargeAuthorizationParams,
  ): Promise<VerifyTransactionResponse> {
    return this.request<VerifyTransactionResponse>(
      "/transaction/charge_authorization",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
  }

  /**
   * List all plans
   */
  async listPlans(): Promise<ListPlansResponse> {
    return this.request<ListPlansResponse>("/plan", {
      method: "GET",
    });
  }

  /**
   * Disable a subscription
   */
  async disableSubscription(
    code: string,
    token: string,
  ): Promise<{ status: boolean; message: string }> {
    return this.request(`/subscription/disable`, {
      method: "POST",
      body: JSON.stringify({ code, token }),
    });
  }

  /**
   * Enable a subscription
   */
  async enableSubscription(
    code: string,
    token: string,
  ): Promise<{ status: boolean; message: string }> {
    return this.request(`/subscription/enable`, {
      method: "POST",
      body: JSON.stringify({ code, token }),
    });
  }
}

/**
 * Get Paystack service instance
 */
export function getPaystackService(): PaystackService {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables");
  }

  return new PaystackService({
    secretKey,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  });
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `shelfcue_${userId.substring(0, 8)}_${timestamp}_${random}`;
}

/**
 * Convert amount from Naira to Kobo
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert amount from Kobo to Naira
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Verify Paystack webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  const crypto = require("node:crypto");
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(
      "PAYSTACK_WEBHOOK_SECRET is not set in environment variables",
    );
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

export type {
  InitializeTransactionParams,
  InitializeTransactionResponse,
  VerifyTransactionResponse,
  CreateSubscriptionParams,
  CreateSubscriptionResponse,
  ChargeAuthorizationParams,
};
