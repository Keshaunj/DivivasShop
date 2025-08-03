# 📧 SendGrid Setup Guide

## 🚀 Quick Setup (10 minutes)

### Step 1: Create SendGrid Account
1. Go to [SendGrid Sign Up](https://signup.sendgrid.com/)
2. Click "Start for Free"
3. Fill in your details:
   - **Email**: Your business email
   - **Password**: Strong password
   - **Company**: Divias Wicka Shop
   - **Website**: Your website (optional)
4. Click "Create Account"

### Step 2: Verify Your Account
1. Check your email for verification link
2. Click the verification link
3. Complete any additional verification steps

### Step 3: Get API Key
1. In SendGrid dashboard, go to "Settings" → "API Keys"
2. Click "Create API Key"
3. Name it: "Divias Shop Backend"
4. Select "Restricted Access" → "Mail Send"
5. Click "Create & View"
6. **Copy the API key** (you'll only see it once!)

### Step 4: Add Environment Variables
Add these to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your-api-key-here
SENDGRID_FROM_EMAIL=noreply@sendgrid.net
FRONTEND_URL=http://localhost:5173
```

### Step 5: Test the Setup
1. Start your backend server
2. Try the "Forgot Password" feature
3. Check your email for the reset link

## 🔧 Troubleshooting

### "Invalid API Key" Error
- Make sure you copied the full API key
- Check that the key has "Mail Send" permissions
- Verify the key is in your .env file

### "From email not verified" Error
- Use `noreply@sendgrid.net` for testing
- Later, verify your custom domain for professional emails

### Emails not sending
- Check console logs for error messages
- Verify API key is correct
- Make sure SendGrid account is active

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

### Email Types Supported
- ✅ **Password reset emails**
- ✅ **Welcome emails**
- ✅ **Order confirmations** (future)
- ✅ **Newsletters** (future)

## 🎯 What Users See

When customers get emails, they'll see:
- **From**: `noreply@sendgrid.net`
- **Subject**: "Reset Your Password - Divias Wicka Shop"
- **Professional**: Divias Wicka Shop branding

## 🔒 Security Features

- ✅ **API key authentication** - Secure access
- ✅ **Rate limiting** - Prevents abuse
- ✅ **Email validation** - Ensures delivery
- ✅ **Spam protection** - Better inbox placement

## 🚀 Production Upgrade

For production, consider:
- **Verify custom domain** - `admin@diviaswickashop.com`
- **Upgrade to paid plan** - More emails, better features
- **Add email templates** - Professional designs
- **Enable analytics** - Track performance

## 📧 Email Templates

The system includes:
- ✅ **Password Reset** - Professional reset emails
- ✅ **Welcome Email** - New user onboarding
- ✅ **HTML Templates** - Beautiful, responsive design
- ✅ **Branded** - Divias Wicka Shop branding

---

**Need help?** Check the SendGrid dashboard for detailed logs and analytics! 