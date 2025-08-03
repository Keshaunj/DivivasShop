# 📧 Email Utilities

This folder contains all email-related functionality for the Divias Wicka Shop application using SendGrid.

## 📁 Files

### `sendgridService.js`
Main email service with SendGrid API integration:
- **Password Reset Emails** - Secure reset links with beautiful templates
- **Welcome Emails** - New user onboarding with shop introduction
- **HTML Templates** - Professional, responsive email designs
- **Error Handling** - Graceful fallbacks and logging

### `index.js`
Clean export interface for all email services.

### `SENDGRID_SETUP.md`
Complete setup guide for SendGrid API configuration.

## 🚀 Usage

```javascript
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');

// Send password reset
await sendPasswordResetEmail(email, resetUrl, username);

// Send welcome email
await sendWelcomeEmail(email, username);
```

## 🔧 Configuration

Required environment variables:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@sendgrid.net
FRONTEND_URL=http://localhost:5173
```

## 📧 Email Templates

### Password Reset Template
- ✅ Professional design with Divias branding
- ✅ Clickable reset button
- ✅ Manual link copy option
- ✅ Security information
- ✅ 1-hour expiration notice

### Welcome Email Template
- ✅ Personalized greeting
- ✅ Shop introduction
- ✅ Feature highlights
- ✅ Direct shopping link
- ✅ Brand personality

## 🔒 Security Features

- **API Key Authentication** - Secure SendGrid access
- **Rate Limiting** - 100 emails/day free tier
- **Token Expiration** - 1-hour reset link validity
- **Error Handling** - No sensitive data exposure

## 📊 SendGrid Benefits

### Professional Appearance
- ✅ **Unknown domain** - Looks more official than Gmail
- ✅ **Used by major companies** - Uber, Airbnb, Spotify
- ✅ **Better deliverability** - 99%+ reach inboxes
- ✅ **Analytics** - Track email performance

### Free Tier Limits
- **Daily limit**: 100 emails/day
- **Monthly limit**: ~3,000 emails/month
- **Perfect for**: Small to medium businesses

## 🎯 Future Enhancements

- [ ] Email verification for new accounts
- [ ] Order confirmation emails
- [ ] Shipping updates
- [ ] Newsletter subscription
- [ ] Admin notification emails
- [ ] Template customization options
- [ ] Custom domain verification (`admin@diviaswickashop.com`)

---

**Setup Guide**: See `SENDGRID_SETUP.md` for detailed configuration instructions. 