import { Resend } from "resend";

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email - should be from your verified domain
export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "ShelfCue <noreply@shelfcue.com>";

/**
 * Email service for sending transactional emails
 */
export class EmailService {
  /**
   * Send form submission notification to form owner
   */
  static async sendFormSubmissionNotification(
    recipientEmail: string,
    {
      formName,
      formId,
      submissionId,
      submittedAt,
      submitterData,
    }: {
      formName: string;
      formId: string;
      submissionId: string;
      submittedAt: string;
      submitterData: Record<string, any>;
    },
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: `New Form Submission: ${formName}`,
        html: EmailService.getFormSubmissionEmailHtml({
          formName,
          formId,
          submissionId,
          submittedAt,
          submitterData,
        }),
      });

      if (error) {
        console.error("Error sending form submission email:", error);
        return { success: false, error };
      }

      console.log("✓ Form submission email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending form submission email:", error);
      return { success: false, error };
    }
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(recipientEmail: string, userName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: "Welcome to ShelfCue! 🎉",
        html: EmailService.getWelcomeEmailHtml(userName),
      });

      if (error) {
        console.error("Error sending welcome email:", error);
        return { success: false, error };
      }

      console.log("✓ Welcome email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }
  }

  /**
   * Send subscription confirmation email
   */
  static async sendSubscriptionConfirmation(
    recipientEmail: string,
    {
      userName,
      planName,
      amount,
      billingCycle,
    }: {
      userName: string;
      planName: string;
      amount: string;
      billingCycle: string;
    },
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: `Subscription Confirmed: ${planName} Plan`,
        html: EmailService.getSubscriptionConfirmationHtml({
          userName,
          planName,
          amount,
          billingCycle,
        }),
      });

      if (error) {
        console.error("Error sending subscription confirmation email:", error);
        return { success: false, error };
      }

      console.log("✓ Subscription confirmation email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending subscription confirmation email:", error);
      return { success: false, error };
    }
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailedNotification(
    recipientEmail: string,
    {
      userName,
      amount,
      reason,
    }: {
      userName: string;
      amount: string;
      reason?: string;
    },
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: "Payment Failed - Action Required",
        html: EmailService.getPaymentFailedHtml({ userName, amount, reason }),
      });

      if (error) {
        console.error("Error sending payment failed email:", error);
        return { success: false, error };
      }

      console.log("✓ Payment failed email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending payment failed email:", error);
      return { success: false, error };
    }
  }

  /**
   * Send invoice notification
   */
  static async sendInvoiceNotification(
    recipientEmail: string,
    {
      userName,
      invoiceNumber,
      amount,
      dueDate,
      invoiceUrl,
    }: {
      userName: string;
      invoiceNumber: string;
      amount: string;
      dueDate: string;
      invoiceUrl?: string;
    },
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: `New Invoice: ${invoiceNumber}`,
        html: EmailService.getInvoiceHtml({
          userName,
          invoiceNumber,
          amount,
          dueDate,
          invoiceUrl,
        }),
      });

      if (error) {
        console.error("Error sending invoice email:", error);
        return { success: false, error };
      }

      console.log("✓ Invoice email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending invoice email:", error);
      return { success: false, error };
    }
  }

  /**
   * Send subscription cancelled notification
   */
  static async sendSubscriptionCancelledNotification(
    recipientEmail: string,
    {
      userName,
      planName,
      endDate,
    }: {
      userName: string;
      planName: string;
      endDate: string;
    },
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: "Subscription Cancelled",
        html: EmailService.getSubscriptionCancelledHtml({
          userName,
          planName,
          endDate,
        }),
      });

      if (error) {
        console.error("Error sending subscription cancelled email:", error);
        return { success: false, error };
      }

      console.log("✓ Subscription cancelled email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending subscription cancelled email:", error);
      return { success: false, error };
    }
  }

  /**
   * Send trial reminder (e.g. day 7 - halfway)
   */
  static async sendTrialReminder(
    recipientEmail: string,
    {
      userName,
      trialEndDate,
      dashboardUrl,
    }: {
      userName: string;
      trialEndDate: string;
      dashboardUrl: string;
    },
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: "You're halfway through your ShelfCue trial",
        html: EmailService.getTrialReminderHtml({
          userName,
          trialEndDate,
          dashboardUrl,
        }),
      });

      if (error) {
        console.error("Error sending trial reminder email:", error);
        return { success: false, error };
      }

      console.log("✓ Trial reminder email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending trial reminder email:", error);
      return { success: false, error };
    }
  }

  /**
   * Send trial ending soon (e.g. 2 days before end)
   */
  static async sendTrialEndingSoon(
    recipientEmail: string,
    {
      userName,
      trialEndDate,
      billingUrl,
    }: {
      userName: string;
      trialEndDate: string;
      billingUrl: string;
    },
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: "Your ShelfCue trial ends in 2 days",
        html: EmailService.getTrialEndingSoonHtml({
          userName,
          trialEndDate,
          billingUrl,
        }),
      });

      if (error) {
        console.error("Error sending trial ending soon email:", error);
        return { success: false, error };
      }

      console.log("✓ Trial ending soon email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending trial ending soon email:", error);
      return { success: false, error };
    }
  }

  /**
   * Send trial expired notification
   */
  static async sendTrialExpired(
    recipientEmail: string,
    {
      userName,
      billingUrl,
    }: {
      userName: string;
      billingUrl: string;
    },
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipientEmail,
        subject: "Your ShelfCue trial has ended",
        html: EmailService.getTrialExpiredHtml({ userName, billingUrl }),
      });

      if (error) {
        console.error("Error sending trial expired email:", error);
        return { success: false, error };
      }

      console.log("✓ Trial expired email sent:", data?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Error sending trial expired email:", error);
      return { success: false, error };
    }
  }

  // ========== HTML Templates ==========

  private static getBaseEmailStyle() {
    return `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo h1 {
          color: #4F46E5;
          font-size: 28px;
          margin: 0;
          font-weight: 700;
        }
        h2 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        p {
          color: #4b5563;
          margin-bottom: 16px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #4338CA;
        }
        .info-box {
          background-color: #f9fafb;
          border-left: 4px solid #4F46E5;
          padding: 16px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
          text-align: center;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .data-table td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .data-table td:first-child {
          font-weight: 600;
          color: #374151;
          width: 40%;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    `;
  }

  private static getFormSubmissionEmailHtml({
    formName,
    formId,
    submissionId,
    submittedAt,
    submitterData,
  }: {
    formName: string;
    formId: string;
    submissionId: string;
    submittedAt: string;
    submitterData: Record<string, any>;
  }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const submissionUrl = `${appUrl}/dashboard/submissions?formId=${formId}`;

    const dataRows = Object.entries(submitterData)
      .map(
        ([key, value]) => `
        <tr>
          <td>${key}</td>
          <td>${value || "—"}</td>
        </tr>
      `,
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>New Form Submission</h2>
            
            <p>You have received a new submission for your form <strong>${formName}</strong>.</p>
            
            <div class="info-box">
              <p style="margin: 0;"><strong>Submitted:</strong> ${new Date(submittedAt).toLocaleString()}</p>
              <p style="margin: 8px 0 0 0;"><strong>Submission ID:</strong> ${submissionId}</p>
            </div>
            
            <h3 style="color: #1f2937; font-size: 18px; margin-top: 30px;">Submission Details</h3>
            <table class="data-table">
              ${dataRows}
            </table>
            
            <a href="${submissionUrl}" class="button">View All Submissions</a>
            
            <div class="footer">
              <p>This is an automated notification from ShelfCue.</p>
              <p>You received this email because you own the form "${formName}".</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getWelcomeEmailHtml(userName: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const dashboardUrl = `${appUrl}/dashboard`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>Welcome to ShelfCue! 🎉</h2>
            
            <p>Hi ${userName},</p>
            
            <p>You're in — here's how to create your first form and connect Google. You have 14 days to try everything.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #1f2937;">Getting Started</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Create your first form in minutes</li>
                <li>Connect Google Calendar for automatic meeting scheduling</li>
                <li>Sync form submissions to Google Sheets automatically</li>
                <li>Share your forms with a single click</li>
              </ul>
            </div>
            
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            
            <p>If you have any questions, don't hesitate to reach out to our support team.</p>
            
            <p>Happy form building!</p>
            <p><strong>The ShelfCue Team</strong></p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ShelfCue. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getSubscriptionConfirmationHtml({
    userName,
    planName,
    amount,
    billingCycle,
  }: {
    userName: string;
    planName: string;
    amount: string;
    billingCycle: string;
  }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const billingUrl = `${appUrl}/dashboard/billing`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>Subscription Confirmed! ✓</h2>
            
            <p>Hi ${userName},</p>
            
            <p>Your subscription to the <strong>${planName}</strong> plan has been confirmed.</p>
            
            <div class="info-box">
              <table style="width: 100%; border: none;">
                <tr>
                  <td style="border: none; padding: 4px 0;"><strong>Plan:</strong></td>
                  <td style="border: none; padding: 4px 0;">${planName}</td>
                </tr>
                <tr>
                  <td style="border: none; padding: 4px 0;"><strong>Amount:</strong></td>
                  <td style="border: none; padding: 4px 0;">${amount}</td>
                </tr>
                <tr>
                  <td style="border: none; padding: 4px 0;"><strong>Billing Cycle:</strong></td>
                  <td style="border: none; padding: 4px 0;">${billingCycle}</td>
                </tr>
              </table>
            </div>
            
            <p>You now have access to all premium features. Start creating unlimited forms and take advantage of advanced integrations.</p>
            
            <a href="${billingUrl}" class="button">Manage Subscription</a>
            
            <div class="footer">
              <p>Thank you for choosing ShelfCue!</p>
              <p>© ${new Date().getFullYear()} ShelfCue. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getPaymentFailedHtml({
    userName,
    amount,
    reason,
  }: {
    userName: string;
    amount: string;
    reason?: string;
  }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const billingUrl = `${appUrl}/dashboard/billing`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>Payment Failed</h2>
            
            <p>Hi ${userName},</p>
            
            <div class="warning">
              <p style="margin: 0;"><strong>We were unable to process your payment of ${amount}.</strong></p>
              ${reason ? `<p style="margin: 8px 0 0 0;">Reason: ${reason}</p>` : ""}
            </div>
            
            <p>To continue enjoying ShelfCue's premium features, please update your payment method or try again.</p>
            
            <a href="${billingUrl}" class="button">Update Payment Method</a>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ShelfCue. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getInvoiceHtml({
    userName,
    invoiceNumber,
    amount,
    dueDate,
    invoiceUrl,
  }: {
    userName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    invoiceUrl?: string;
  }) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>New Invoice</h2>
            
            <p>Hi ${userName},</p>
            
            <p>A new invoice has been generated for your ShelfCue subscription.</p>
            
            <div class="info-box">
              <table style="width: 100%; border: none;">
                <tr>
                  <td style="border: none; padding: 4px 0;"><strong>Invoice Number:</strong></td>
                  <td style="border: none; padding: 4px 0;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="border: none; padding: 4px 0;"><strong>Amount Due:</strong></td>
                  <td style="border: none; padding: 4px 0;">${amount}</td>
                </tr>
                <tr>
                  <td style="border: none; padding: 4px 0;"><strong>Due Date:</strong></td>
                  <td style="border: none; padding: 4px 0;">${new Date(dueDate).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            ${invoiceUrl ? `<a href="${invoiceUrl}" class="button">View Invoice</a>` : ""}
            
            <p>Payment will be automatically processed using your saved payment method.</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ShelfCue. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getSubscriptionCancelledHtml({
    userName,
    planName,
    endDate,
  }: {
    userName: string;
    planName: string;
    endDate: string;
  }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const billingUrl = `${appUrl}/dashboard/billing`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>Subscription Cancelled</h2>
            
            <p>Hi ${userName},</p>
            
            <p>Your <strong>${planName}</strong> subscription has been cancelled.</p>
            
            <div class="info-box">
              <p style="margin: 0;">You'll continue to have access to premium features until <strong>${new Date(endDate).toLocaleDateString()}</strong>.</p>
            </div>
            
            <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription at any time.</p>
            
            <a href="${billingUrl}" class="button">Reactivate Subscription</a>
            
            <p>If you have any feedback about your experience with ShelfCue, we'd love to hear from you.</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ShelfCue. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getTrialReminderHtml({
    userName,
    trialEndDate,
    dashboardUrl,
  }: {
    userName: string;
    trialEndDate: string;
    dashboardUrl: string;
  }) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>You're halfway through your trial</h2>
            
            <p>Hi ${userName},</p>
            
            <p>You're halfway through your trial. Here's what you can do before it ends.</p>
            
            <div class="info-box">
              <p style="margin: 0;">Your trial ends on <strong>${new Date(trialEndDate).toLocaleDateString()}</strong>. Create forms, connect Google Calendar and Sheets, and explore all features.</p>
            </div>
            
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ShelfCue. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getTrialEndingSoonHtml({
    userName,
    trialEndDate,
    billingUrl,
  }: {
    userName: string;
    trialEndDate: string;
    billingUrl: string;
  }) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>Your trial ends in 2 days</h2>
            
            <p>Hi ${userName},</p>
            
            <p>Your trial ends on <strong>${new Date(trialEndDate).toLocaleDateString()}</strong>. Subscribe to keep your forms and data.</p>
            
            <a href="${billingUrl}" class="button">Subscribe Now</a>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ShelfCue. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getTrialExpiredHtml({
    userName,
    billingUrl,
  }: {
    userName: string;
    billingUrl: string;
  }) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${EmailService.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <h1>ShelfCue</h1>
            </div>
            
            <h2>Your trial has ended</h2>
            
            <p>Hi ${userName},</p>
            
            <p>Your trial has ended. Subscribe to reactivate your forms and keep receiving submissions.</p>
            
            <a href="${billingUrl}" class="button">Subscribe to ShelfCue</a>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ShelfCue. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
