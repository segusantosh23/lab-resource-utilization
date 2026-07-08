# 🚀 Quick Brevo Email Test Guide

Your Brevo credentials are already configured! Let's test if they work.

## ✅ Your Current Configuration:
```properties
spring.mail.host=smtp-relay.brevo.com
spring.mail.port=587
spring.mail.username=b1447000@smtp-brevo.com
spring.mail.password=xsmtpsib-7297db496d9bdf35e51b1e0aba81fd00ae74c72675fcd8696696467059d980b9-JOipOzGnRCR1Ix0m
```

## 🧪 Method 1: Online SMTP Tester (Recommended)

1. **Go to**: https://www.smtper.net/
2. **Fill in these exact details**:
   ```
   SMTP Server: smtp-relay.brevo.com
   Port: 587
   Username: b1447000@smtp-brevo.com  
   Password: xsmtpsib-7297db496d9bdf35e51b1e0aba81fd00ae74c72675fcd8696696467059d980b9-JOipOzGnRCR1Ix0m
   
   From: b1447000@smtp-brevo.com
   To: priyadharshimanikandan25@gmail.com
   Subject: Test Email from Brevo
   Message: This is a test email to verify Brevo SMTP configuration works!
   ```
3. **Click "Send Test Email"**
4. **Check your inbox** (priyadharshimanikandan25@gmail.com)

**Expected Result**: ✅ You should receive the test email within 1-2 minutes

---

## 🧪 Method 2: Fix Backend and Test

The backend startup issue might be due to compilation errors. Let's fix it:

### Step 1: Clean and Rebuild
```bash
cd "C:\Users\PRIYA DHARSHINI\Desktop\intern 2\lab-resource-utilization-platform-group-2\lab-resource-utilization"
./mvnw clean
./mvnw compile -DskipTests
```

### Step 2: Start Backend
```bash
./mvnw spring-boot:run -DskipTests
```

### Step 3: Test Signup Flow
1. Go to: http://localhost:5173/signup
2. Enter email: priyadharshimanikandan25@gmail.com
3. Click "Continue"
4. Check your email inbox for OTP

---

## 🛠️ Troubleshooting

### ❌ If Email Test Fails:
1. **Wrong credentials**: Double-check Brevo username/password
2. **Brevo account issue**: Login to Brevo dashboard, verify account is active
3. **Network issue**: Check internet connection
4. **Brevo API limits**: Verify you haven't exceeded 300 emails/day

### ❌ If Backend Won't Start:
1. **Database issue**: Make sure PostgreSQL is running
2. **Port conflict**: Check if port 8086 is free
3. **Compilation error**: Run `./mvnw clean compile` to see specific errors

### ❌ If Frontend Has Issues:
```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Success Indicators

### ✅ **Email Working**: 
- Test email arrives in your Gmail inbox
- Subject: "Test Email from Brevo" 
- Sender shows as your Brevo email

### ✅ **Backend Working**:
- Console shows: "Tomcat started on port 8086"
- No error messages about database or email configuration
- API responds at http://localhost:8086

### ✅ **Full System Working**:
- Signup form loads at http://localhost:5173/signup
- Entering email sends OTP to your actual inbox
- OTP verification works and creates account

---

## 📞 Quick Test Commands

**Test Database Connection:**
```bash
psql -h localhost -p 5432 -U postgres -d mydb
```

**Test Backend Health:**
```bash
curl http://localhost:8086/actuator/health
```

**Test Frontend:**
- Open: http://localhost:5173

---

## ⚡ Expected Workflow

1. **Start PostgreSQL** (should already be running)
2. **Start Backend**: `./mvnw spring-boot:run -DskipTests`  
3. **Start Frontend**: `npm run dev` (in frontend folder)
4. **Test Signup**: http://localhost:5173/signup
5. **Verify OTP Email**: Check Gmail inbox

**Total time**: 2-3 minutes to get everything running!

---

## 🎉 Next Steps After Success

Once email is working:
- ✅ OTP verification for signup  
- ✅ Password reset via email
- ✅ Welcome emails for new users
- ✅ 300 free emails per day with Brevo
- ✅ Professional email delivery

**You'll have a complete, production-ready email OTP system!** 🚀