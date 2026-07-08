# 📧 Brevo Email Service Setup Guide

## Why Brevo?
- **100% FREE** for up to 300 emails/day
- **No App Passwords required** (unlike Gmail)
- **Reliable SMTP service**
- **Easy setup** - just username/password
- **Professional email delivery**

---

## 🚀 Step-by-Step Setup

### 1. Create Brevo Account (2 minutes)
1. Go to: https://app.brevo.com/account/register
2. Sign up with your email address
3. Verify your email account
4. Complete the basic account setup

### 2. Get SMTP Credentials (1 minute)
1. After login, go to **Settings** (gear icon in top-right)
2. Click **SMTP & API** in the left menu
3. Click **SMTP** tab
4. You'll see:
   ```
   Server: smtp-relay.brevo.com
   Port: 587
   Login: your-email@example.com
   Password: xsmtpsib-xxxxxxxxxx (long key)
   ```
5. **Copy the Login and Password** - you'll need these!

### 3. Configure Your Application

#### Option A: Environment Variables (Recommended)
Create a `.env` file in your project root:
```env
BREVO_SMTP_LOGIN=your-email@example.com
BREVO_SMTP_PASSWORD=xsmtpsib-your-long-brevo-key
```

#### Option B: Direct Configuration
Update `application.properties`:
```properties
spring.mail.username=your-email@example.com
spring.mail.password=xsmtpsib-your-long-brevo-key
```

### 4. Test Email Sending
1. Start your backend: `./mvnw spring-boot:run`
2. Start your frontend: `npm run dev`
3. Go to: http://localhost:5173/signup
4. Enter any email address
5. Check the email inbox - OTP should arrive in 30-60 seconds

---

## 🔧 Complete Configuration Example

### application.properties
```properties
# Email Configuration - Brevo (Free Email Service)
spring.mail.host=smtp-relay.brevo.com
spring.mail.port=587
spring.mail.username=${BREVO_SMTP_LOGIN:your-brevo-email@example.com}
spring.mail.password=${BREVO_SMTP_PASSWORD:your-brevo-smtp-key}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.debug=false

# Application settings
app.name=Lab Resource Platform
app.base-url=http://localhost:5173
app.otp.expiry-minutes=5
app.support-email=support@labresource.com
```

---

## 🎯 Key Features

### ✅ What's Implemented:
- **Email OTP Verification** for signup
- **6-digit random OTP** generation
- **5-minute expiry time**
- **Email format validation**
- **Duplicate email check**
- **Resend OTP** with 30-second cooldown
- **Beautiful HTML email templates**
- **Proper error handling**
- **Security best practices**

### 📱 Frontend Features:
- **3-step signup flow**
- **Real-time OTP validation**
- **Countdown timer** for resend
- **Loading states** and spinners
- **Error/success notifications**
- **Responsive design**

---

## 🛠️ Troubleshooting

### Email Not Arriving?
1. **Check Spam/Junk folder**
2. **Verify Brevo credentials** are correct
3. **Check backend logs** for error messages
4. **Ensure internet connection** is stable
5. **Try a different email address**

### Common Error Messages:
- `"Authentication failed"` = Wrong username/password
- `"Connection timeout"` = Network/firewall issue
- `"Invalid recipient"` = Malformed email address
- `"Rate limit exceeded"` = Too many emails sent (300/day limit)

### Backend Logs to Monitor:
```
✅ OTP email sent successfully to: user@example.com
❌ Failed to send OTP email to: user@example.com
📧 [OTP GENERATED] Email: user@example.com | OTP: 123456
```

---

## 🔒 Security Features

- **OTP expires in 5 minutes**
- **Previous OTPs invalidated** when new one is generated
- **Rate limiting** - 30-second resend cooldown
- **Input validation** - email format checking
- **HTML escaping** - prevents XSS attacks
- **Secure random OTP** generation
- **No sensitive data** in error messages

---

## 📈 Free Usage Limits

**Brevo Free Plan:**
- ✅ **300 emails/day**
- ✅ **Unlimited contacts**
- ✅ **Professional SMTP**
- ✅ **Email templates**
- ✅ **Delivery statistics**

This is perfect for development and small-scale applications!

---

## 🎉 Ready to Test!

Once configured, your signup flow will be:
1. User enters email → System checks if email exists
2. System generates 6-digit OTP → Sends via Brevo SMTP
3. User receives email → Enters OTP → Account created!

**URLs to test:**
- Backend: http://localhost:8086
- Frontend: http://localhost:5173/signup