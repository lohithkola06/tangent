# Supabase Password Reset Configuration

This guide provides the configuration needed to enable password reset functionality in your Supabase project.

## 1. Email Templates Configuration

### Navigate to Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Email Templates**

### Configure Password Reset Email Template

**Template Type:** Reset Password

**Subject Line:**

```
Reset your password for {{ .SiteName }}
```

**HTML Template:**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
          "Oxygen", "Ubuntu", "sans-serif";
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .container {
        background-color: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #2563eb;
        margin-bottom: 10px;
      }
      .title {
        font-size: 20px;
        margin-bottom: 20px;
        color: #1f2937;
      }
      .button {
        display: inline-block;
        background-color: #2563eb;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        margin: 20px 0;
      }
      .button:hover {
        background-color: #1d4ed8;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 14px;
        color: #6b7280;
      }
      .warning {
        background-color: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
        color: #92400e;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">{{ .SiteName }}</div>
        <h1 class="title">Reset Your Password</h1>
      </div>

      <p>Hello,</p>

      <p>
        We received a request to reset the password for your account. If you
        made this request, click the button below to set a new password:
      </p>

      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This link will expire in 1 hour for
        your security. If you didn't request this password reset, you can safely
        ignore this email.
      </div>

      <p>
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="word-break: break-all; color: #2563eb;">
        {{ .ConfirmationURL }}
      </p>

      <div class="footer">
        <p>If you're having trouble, contact our support team.</p>
        <p>This is an automated email, please do not reply.</p>
      </div>
    </div>
  </body>
</html>
```

## 2. Authentication Settings

### Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set your **Site URL** to your production domain (e.g., `https://yourdomain.com`)
3. For development, you can use `http://localhost:3000`

### Add Redirect URLs

In the **Redirect URLs** section, add:

```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
http://localhost:3000/reset-password
https://yourdomain.com/reset-password
```

**Note:** The `/auth/callback` URL is the primary redirect that handles the authentication tokens, while `/reset-password` is included as a fallback for direct access.

## 3. Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Email Provider Configuration (Optional but Recommended)

By default, Supabase uses their built-in email service, but for production, it's recommended to configure your own SMTP provider.

### Configure Custom SMTP

1. Go to **Authentication** → **Settings**
2. Scroll down to **SMTP Settings**
3. Configure your preferred email provider (SendGrid, Mailgun, etc.)

Example for SendGrid:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your_sendgrid_api_key
Sender Email: noreply@yourdomain.com
Sender Name: Your App Name
```

## 5. Security Considerations

### Password Reset Link Expiration

- Links expire after 1 hour by default
- Users can request multiple reset links
- Only the most recent link remains valid

### Rate Limiting

Supabase automatically implements rate limiting for password reset requests to prevent abuse.

## 6. Testing the Implementation

### Local Testing

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/forgot-password`
3. Enter an email address that exists in your auth.users table
4. Check your email for the reset link
5. Click the link to test the reset password flow

### Troubleshooting Common Issues

**"Invalid Reset Link" error:**

1. **Check Redirect URLs:** Ensure you've added both callback URLs in Supabase:

   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

2. **Verify Site URL:** Make sure your Site URL in Supabase matches your domain exactly

   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

3. **Email Link Format:** Supabase should generate links like:

   ```
   http://localhost:3000/auth/callback?code=xxx&next=/reset-password
   ```

4. **Clear Browser Cache:** Sometimes old cached tokens can cause issues

5. **Check Email Provider:** If using a custom SMTP provider, ensure emails are being delivered properly

**Email not received:**

- Check spam/junk folder
- Verify the email address exists in your auth.users table
- Check Supabase logs in the dashboard

**Reset link not working:**

- Ensure the redirect URL is properly configured
- Check that the link hasn't expired (1 hour limit)
- Verify the site URL configuration matches your domain

**CORS errors:**

- Make sure your domain is added to the allowed origins in Supabase
- Check that the site URL is correctly configured

## 7. Pages and Components Created

The following files have been created for the password reset functionality:

### Pages

- `/src/app/forgot-password/page.tsx` - Forgot password page
- `/src/app/reset-password/page.tsx` - Reset password page

### Components

- `/src/components/auth/forgot-password-form.tsx` - Forgot password form
- `/src/components/auth/reset-password-form.tsx` - Reset password form

### Features Included

- Email validation
- Loading states
- Error handling
- Success confirmations
- Token validation
- Password strength requirements
- Responsive design
- Accessible form elements

## 8. User Flow

1. **Forgot Password Request:**

   - User goes to `/forgot-password`
   - Enters their email address
   - Submits the form
   - Receives confirmation message

2. **Email Reception:**

   - User receives password reset email
   - Email contains secure reset link
   - Link is valid for 1 hour

3. **Password Reset:**
   - User clicks link in email
   - Redirected to `/reset-password` with tokens
   - Enters new password (with confirmation)
   - Password is updated successfully
   - User is redirected to sign in page

## 9. Customization Options

### Styling

All components use Tailwind CSS and shadcn/ui components, making them easy to customize to match your brand.

### Email Template

The HTML email template can be further customized with your branding, colors, and messaging.

### Validation Rules

Password validation rules can be modified in the `validateForm` function within the reset password component.

### Redirect Behavior

After successful password reset, users are redirected to the sign-in page. This can be customized in the `handleSubmit` function.

---

This configuration will provide a complete, secure password reset system for your Next.js application using Supabase authentication.
