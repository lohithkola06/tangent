# Email Service Setup Guide

This application supports multiple email providers for sending invitation and welcome emails. Choose the provider that best fits your needs.

## Environment Variables

Add these variables to your `.env.local` file:

### Basic Configuration

```bash
# Required: Choose your email provider
EMAIL_PROVIDER=console  # Options: console, resend, sendgrid, smtp

# Required: Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Provider-Specific Setup

### 1. Console Provider (Development)

**Best for:** Local development and testing
**Setup:** No additional configuration needed

```bash
EMAIL_PROVIDER=console
```

Emails will be logged to the console instead of being sent.

### 2. Resend (Recommended)

**Best for:** Production use, excellent deliverability
**Setup:**

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Get your API key from the dashboard

```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxx
```

### 3. SendGrid

**Best for:** Enterprise use, advanced features
**Setup:**

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender identity
3. Create an API key with mail send permissions

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxx
```

### 4. SMTP (Custom Email Server)

**Best for:** Using existing email infrastructure
**Setup:** Configure with your SMTP server details

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Gmail SMTP Example:

1. Enable 2-factor authentication on your Google account
2. Generate an app-specific password
3. Use these settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Secure: `false`
   - User: Your Gmail address
   - Pass: Your app-specific password

## Email Templates

The application includes professionally designed email templates:

### Invitation Email

- Clean, responsive HTML design
- Case details and deadline information
- Direct login links with pre-filled email
- Clear call-to-action buttons
- Expiration warnings

### Welcome Email

- Branded welcome message
- Dashboard access link
- Professional styling

### Reminder Email

- Urgent styling for overdue questionnaires
- Enhanced call-to-action
- Deadline emphasis

## Testing Email Integration

1. **Console Mode (Development):**

   ```bash
   EMAIL_PROVIDER=console
   ```

   Check your server logs to see email content.

2. **Test with Real Provider:**
   Set up any provider above and create a test case:

   ```bash
   # Start your development server
   npm run dev

   # Create a new case in the employer dashboard
   # Check your email inbox for the invitation
   ```

3. **Email Debugging:**
   Enable detailed logging by checking the browser console and server logs for email-related messages.

## Production Deployment

### Recommended Setup:

1. **Use Resend** for reliability and ease of setup
2. **Verify your domain** for better deliverability
3. **Set up DNS records** (SPF, DKIM, DMARC)
4. **Monitor email delivery** through your provider's dashboard

### Environment Variables for Production:

```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_production_api_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Troubleshooting

### Common Issues:

1. **Emails not sending:**

   - Check API keys are correct
   - Verify sender domain is authenticated
   - Check server logs for error messages

2. **Emails going to spam:**

   - Set up proper DNS records (SPF, DKIM, DMARC)
   - Use authenticated sending domains
   - Avoid spam trigger words in subject lines

3. **Template rendering issues:**
   - Verify environment variables are set
   - Check for missing case data
   - Test with console provider first

### Support:

- Check your email provider's documentation
- Review server logs for detailed error messages
- Test with console provider to verify template generation
