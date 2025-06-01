export interface EmailProvider {
  send(params: EmailParams): Promise<void>
}

export interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

export interface InvitationEmailData {
  firstName: string
  lastName: string
  employerName: string
  caseType: string
  jobTitle: string
  loginUrl: string
  expiresAt: string
  isReminder?: boolean
}

// Resend Email Provider
class ResendProvider implements EmailProvider {
  private resend: any

  constructor(apiKey: string) {
    // Dynamic import to avoid bundling issues
    this.initResend(apiKey)
  }

  private async initResend(apiKey: string) {
    const { Resend } = await import('resend')
    this.resend = new Resend(apiKey)
  }

  async send(params: EmailParams): Promise<void> {
    try {
      if (!this.resend) {
        const { Resend } = await import('resend')
        this.resend = new Resend(process.env.RESEND_API_KEY!)
      }

      const { data, error } = await this.resend.emails.send({
        from: params.from || 'H1-B Portal <noreply@h1bportal.com>',
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text
      })

      if (error) {
        throw new Error(`Resend error: ${error.message}`)
      }

      console.log('Email sent successfully via Resend:', data)
    } catch (error: any) {
      console.error('Resend send error:', error)
      throw error
    }
  }
}

// SendGrid Email Provider
class SendGridProvider implements EmailProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async send(params: EmailParams): Promise<void> {
    try {
      // Dynamic import to avoid bundling issues
      const sgMail = (await import('@sendgrid/mail')).default
      sgMail.setApiKey(this.apiKey)

      const msg = {
        to: params.to,
        from: params.from || 'noreply@h1bportal.com',
        subject: params.subject,
        text: params.text,
        html: params.html,
      }

      await sgMail.send(msg)
      console.log('Email sent successfully via SendGrid')
    } catch (error: any) {
      console.error('SendGrid send error:', error)
      throw error
    }
  }
}

// Nodemailer Email Provider (for development/SMTP)
class NodemailerProvider implements EmailProvider {
  private transporter: any
  private config: any

  constructor(config: any) {
    this.config = config
  }

  private async getTransporter() {
    if (!this.transporter) {
      // Dynamic import to avoid bundling issues
      const nodemailer = await import('nodemailer')
      this.transporter = nodemailer.default.createTransporter(this.config)
    }
    return this.transporter
  }

  async send(params: EmailParams): Promise<void> {
    try {
      const transporter = await this.getTransporter()
      
      const info = await transporter.sendMail({
        from: params.from || '"H1-B Portal" <noreply@h1bportal.com>',
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      })

      console.log('Email sent successfully via Nodemailer:', info.messageId)
    } catch (error: any) {
      console.error('Nodemailer send error:', error)
      throw error
    }
  }
}

export class EmailService {
  private provider: EmailProvider | null = null

  constructor() {
    // Don't initialize provider in constructor to avoid import issues
  }

  private async createProvider(): Promise<EmailProvider> {
    if (this.provider) {
      return this.provider
    }

    const emailProvider = process.env.EMAIL_PROVIDER || 'console'

    switch (emailProvider.toLowerCase()) {
      case 'resend':
        if (!process.env.RESEND_API_KEY) {
          throw new Error('RESEND_API_KEY environment variable is required')
        }
        this.provider = new ResendProvider(process.env.RESEND_API_KEY)
        break

      case 'sendgrid':
        if (!process.env.SENDGRID_API_KEY) {
          throw new Error('SENDGRID_API_KEY environment variable is required')
        }
        this.provider = new SendGridProvider(process.env.SENDGRID_API_KEY)
        break

      case 'smtp':
      case 'nodemailer':
        const smtpConfig = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
        this.provider = new NodemailerProvider(smtpConfig)
        break

      default:
        // Console provider for development
        this.provider = {
          async send(params: EmailParams): Promise<void> {
            console.log('=== EMAIL WOULD BE SENT ===')
            console.log('To:', params.to)
            console.log('Subject:', params.subject)
            console.log('HTML:', params.html)
            console.log('Text:', params.text)
            console.log('==========================')
          }
        }
    }

    return this.provider
  }

  async sendInvitationEmail(
    email: string,
    data: InvitationEmailData
  ): Promise<void> {
    const provider = await this.createProvider()
    const { html, text } = this.generateInvitationTemplate(data)

    const subject = data.isReminder 
      ? 'Reminder: Complete Your H1-B Petition Questionnaire'
      : 'H1-B Petition Questionnaire - Action Required'

    await provider.send({
      to: email,
      subject,
      html,
      text
    })
  }

  private generateInvitationTemplate(data: InvitationEmailData): { html: string; text: string } {
    const {
      firstName,
      lastName,
      employerName,
      caseType,
      jobTitle,
      loginUrl,
      expiresAt,
      isReminder
    } = data

    const expirationDate = new Date(expiresAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const reminderText = isReminder ? 'This is a reminder that you have' : 'You have'
    const greeting = isReminder ? 'Reminder:' : 'Action Required:'

    // HTML Template
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>H1-B Petition Questionnaire</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: ${isReminder ? '#dc2626' : '#059669'};
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .highlight-box {
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #1d4ed8;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">H1-B Portal</div>
            <div class="greeting">${greeting} Complete Your Questionnaire</div>
        </div>
        
        <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            
            <p>${reminderText} been assigned a questionnaire to complete for your H1-B petition process.</p>
            
            <div class="highlight-box">
                <strong>Case Details:</strong><br>
                Position: ${jobTitle}<br>
                Petition Type: ${caseType.replace('_', ' ').toUpperCase()}<br>
                ${employerName ? `Employer: ${employerName}<br>` : ''}
                Due Date: ${expirationDate}
            </div>
            
            <p>To complete your questionnaire, please sign in to your account using the button below:</p>
            
            <div style="text-align: center;">
                <a href="${loginUrl}" class="cta-button">Sign In & Complete Questionnaire</a>
            </div>
            
            <p><strong>Don't have an account yet?</strong> No problem! Click the button above and register using this email address (${data.firstName}). Once registered, you'll see your questionnaire in your dashboard.</p>
            
            <div class="warning">
                <strong>Important:</strong> This invitation will expire on ${expirationDate}. Please complete your questionnaire before this date to avoid delays in your petition process.
            </div>
            
            <p>The questionnaire covers important information about your background, education, work experience, and immigration history. It typically takes 30-45 minutes to complete, and you can save your progress and return later.</p>
            
            <p>If you have any questions or need assistance, please contact your employer or attorney handling your case.</p>
        </div>
        
        <div class="footer">
            <p>Best regards,<br>
            The H1-B Portal Team</p>
            
            <p style="margin-top: 20px; font-size: 12px;">
                This is an automated message. Please do not reply to this email. If you received this email in error, please ignore it.
            </p>
        </div>
    </div>
</body>
</html>
    `

    // Plain Text Template
    const text = `
${greeting} Complete Your H1-B Petition Questionnaire

Dear ${firstName} ${lastName},

${reminderText} been assigned a questionnaire to complete for your H1-B petition process.

CASE DETAILS:
Position: ${jobTitle}
Petition Type: ${caseType.replace('_', ' ').toUpperCase()}
${employerName ? `Employer: ${employerName}\n` : ''}Due Date: ${expirationDate}

To complete your questionnaire, please sign in to your account:
${loginUrl}

Don't have an account yet? No problem! Visit the link above and register using this email address. Once registered, you'll see your questionnaire in your dashboard.

IMPORTANT: This invitation will expire on ${expirationDate}. Please complete your questionnaire before this date to avoid delays in your petition process.

The questionnaire covers important information about your background, education, work experience, and immigration history. It typically takes 30-45 minutes to complete, and you can save your progress and return later.

If you have any questions or need assistance, please contact your employer or attorney handling your case.

Best regards,
The H1-B Portal Team

---
This is an automated message. Please do not reply to this email. If you received this email in error, please ignore it.
    `

    return { html, text }
  }

  async sendWelcomeEmail(email: string, firstName: string, lastName: string): Promise<void> {
    const provider = await this.createProvider()
    const { html, text } = this.generateWelcomeTemplate(firstName, lastName)

    await provider.send({
      to: email,
      subject: 'Welcome to H1-B Portal',
      html,
      text
    })
  }

  private generateWelcomeTemplate(firstName: string, lastName: string): { html: string; text: string } {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to H1-B Portal</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; margin-bottom: 30px; }
        .cta-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">H1-B Portal</div>
        <h2>Welcome, ${firstName}!</h2>
        <p>Your account has been successfully created. You can now access your dashboard to view and complete any assigned H1-B questionnaires.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">Go to Dashboard</a>
        </div>
        <p>If you have any questions, please don't hesitate to contact support.</p>
        <p>Best regards,<br>The H1-B Portal Team</p>
    </div>
</body>
</html>
    `

    const text = `
Welcome to H1-B Portal!

Dear ${firstName},

Your account has been successfully created. You can now access your dashboard to view and complete any assigned H1-B questionnaires.

Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

If you have any questions, please don't hesitate to contact support.

Best regards,
The H1-B Portal Team
    `

    return { html, text }
  }
} 