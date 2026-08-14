# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Lab Resource Utilization Platform - Full Stack Deployment

---

## ✅ **PROJECT ANALYSIS (Auto-Detected from MAIN branch)**

### **Backend Stack:**
- **Framework:** Spring Boot 4.1.0
- **Java Version:** 21
- **Build Tool:** Maven (Wrapper included)
- **Database:** PostgreSQL
- **Port:** 8081 (configurable via $PORT)
- **Key Dependencies:** Spring Security, JWT, JavaMail, JPA/Hibernate, Lombok

### **Frontend Stack:**
- **Framework:** React 19.2.7
- **Build Tool:** Vite 8.1.1
- **UI Framework:** TailwindCSS 4.3.2
- **Dev Port:** 5173
- **Key Libraries:** axios, react-router-dom, FullCalendar, recharts, jspdf

### **Features Detected:**
✅ JWT Authentication & Authorization  
✅ Email/OTP Verification System  
✅ Equipment Management & Booking  
✅ Maintenance Request System  
✅ Calibration Tracking  
✅ Waitlist Management  
✅ Analytics Dashboard  
✅ Role-Based Access Control  
✅ PDF Report Generation  
✅ Real-time Notifications  

---

## 📋 **REQUIRED ENVIRONMENT VARIABLES**

### **Database Configuration**
```env
DB_URL=jdbc:postgresql://your-db-host:5432/your-database?sslmode=require
DB_USERNAME=your-db-username
DB_PASSWORD=your-secure-db-password
```

### **Email Service Configuration (Gmail or Brevo)**
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

### **Application Configuration**
```env
APP_NAME=Lab Resource Platform
APP_BASE_URL=https://your-frontend-domain.com
APP_SUPPORT_EMAIL=support@yourdomain.com
```

### **Frontend Environment Variable**
```env
VITE_API_URL=https://your-backend-domain.com
```

---

## 🗄️ **STEP 1: Setup Cloud PostgreSQL Database**

### **Option A: Neon.tech (Recommended - Free, No Credit Card)**

1. **Sign Up:**
   - Go to https://neon.tech
   - Click "Sign Up" (GitHub/Google login available)

2. **Create Project:**
   - Click "New Project"
   - Project Name: `lab-resource-db`
   - Region: Choose closest to you (e.g., `us-east-1`)
   - Click "Create"

3. **Get Connection Details:**
   - After creation, copy the **Connection String**
   - Format: `jdbc:postgresql://ep-xxx-12345.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - Note down:
     - Host
     - Database name
     - Username
     - Password

4. **Save for Later:**
   ```env
   DB_URL=jdbc:postgresql://ep-xxx-12345.us-east-1.aws.neon.tech/neondb?sslmode=require
   DB_USERNAME=neondb_owner
   DB_PASSWORD=<your-generated-password>
   ```

### **Option B: Supabase (Alternative)**
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Project Settings → Database
4. Use JDBC format for Java

### **Option C: Railway.app PostgreSQL (Integrated)**
- Railway can create PostgreSQL automatically during deployment

---

## 📧 **STEP 2: Setup Email Service**

### **Option A: Gmail App Password (Free)**

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Lab Platform"
   - Copy the 16-character password

3. **Save Credentials:**
   ```env
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=<16-char-app-password>
   ```

### **Option B: Brevo SMTP (Alternative)**
1. Sign up at https://brevo.com (free 300 emails/day)
2. Get SMTP credentials from Settings → SMTP & API
3. Use Brevo SMTP settings

---

## 🌐 **STEP 3: DEPLOY TO RENDER.COM (Recommended - Easy & Free)**

### **3.1 Deploy Backend (Spring Boot)**

1. **Sign Up & Connect GitHub:**
   - Go to https://render.com
   - Click "Get Started for Free"
   - Connect your GitHub account

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Select your repository: `lab-resource-utilization-platform-group-2`
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `lab-backend` (or your choice)
   - **Branch:** `main`
   - **Root Directory:** `lab-resource-utilization`
   - **Environment:** `Java 21`
   - **Build Command:**
     ```bash
     ./mvnw clean package -DskipTests
     ```
   - **Start Command:**
     ```bash
     java -Dserver.port=$PORT -jar target/*.jar
     ```

4. **Add Environment Variables:**
   Click "Add Environment Variable" for each:
   - `DB_URL` = `jdbc:postgresql://...` (from Step 1)
   - `DB_USERNAME` = `neondb_owner` (from Step 1)
   - `DB_PASSWORD` = `<your-db-password>` (from Step 1)
   - `MAIL_HOST` = `smtp.gmail.com` (from Step 2)
   - `MAIL_PORT` = `587`
   - `MAIL_USERNAME` = `your-email@gmail.com` (from Step 2)
   - `MAIL_PASSWORD` = `<your-app-password>` (from Step 2)
   - `APP_SUPPORT_EMAIL` = `support@yourdomain.com`
   - `APP_BASE_URL` = (Leave empty for now, will update after frontend deployment)

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 3-5 minutes for build and deployment
   - **IMPORTANT:** Copy your backend URL (e.g., `https://lab-backend.onrender.com`)

### **3.2 Deploy Frontend (React)**

1. **Create Static Site:**
   - Click "New +" → "Static Site"
   - Select same repository
   - Click "Connect"

2. **Configure Site:**
   - **Name:** `lab-frontend`
   - **Branch:** `main`
   - **Root Directory:** `lab-resource-utilization/frontend`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `dist`

3. **Add Environment Variable:**
   - `VITE_API_URL` = `https://lab-backend.onrender.com` (your backend URL from 3.1)

4. **Deploy:**
   - Click "Create Static Site"
   - Wait 2-3 minutes for deployment
   - **Copy your frontend URL** (e.g., `https://lab-frontend.onrender.com`)

### **3.3 Update Backend CORS Configuration**

⚠️ **CRITICAL:** Backend must allow requests from your frontend domain!

1. **Go back to your Backend Service on Render**
2. **Add/Update Environment Variable:**
   - `APP_BASE_URL` = `https://lab-frontend.onrender.com` (your frontend URL)

3. **Update Code (if needed):**
   - Open: `lab-resource-utilization/src/main/java/com/example/lab_resource_utilization/config/SecurityConfig.java`
   - Find the `corsConfigurationSource()` method
   - Update allowed origins:
     ```java
     configuration.setAllowedOrigins(List.of(
         "http://localhost:5173",  // Keep for local dev
         "https://lab-frontend.onrender.com",  // ← ADD YOUR FRONTEND URL
         "https://your-custom-domain.com"  // If using custom domain
     ));
     ```
   - Commit and push to GitHub
   - Render will auto-redeploy

---

## 🔧 **ALTERNATIVE: DEPLOY TO RAILWAY.APP**

### **Backend Deployment:**

1. **Sign Up:** https://railway.app
2. **Create New Project:**
   - "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Branch: `main`

3. **Add PostgreSQL Database:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-generates connection string
   - Connection string available as `${{Postgres.DATABASE_URL}}`

4. **Configure Backend Service:**
   - **Root Directory:** `lab-resource-utilization`
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/*.jar`
   
5. **Add Environment Variables:**
   - Railway auto-injects `DATABASE_URL` (PostgreSQL format)
   - Convert to JDBC format or use Railway's PostgreSQL variables:
     - `DB_URL=${{Postgres.JDBC_URL}}`
     - `DB_USERNAME=${{Postgres.PGUSER}}`
     - `DB_PASSWORD=${{Postgres.PGPASSWORD}}`
   - Add mail and app config variables

6. **Deploy & Get URL**

### **Frontend Deployment:**

1. **Add Service to Same Project:**
   - Click "New" → "GitHub Repo" → Select same repo
   - **Root Directory:** `lab-resource-utilization/frontend`

2. **Configure:**
   - **Build Command:** `npm install && npm run build && npm install -g serve`
   - **Start Command:** `serve -s dist -l $PORT`

3. **Add Environment Variable:**
   - `VITE_API_URL` = `<your-backend-railway-url>`

4. **Deploy**

---

## ✅ **STEP 4: VERIFY BUILD LOCALLY (Before Deploying)**

### **Test Backend Build:**
```powershell
cd "c:\Users\PRIYA DHARSHINI\Desktop\intern 2\lab-resource-utilization-platform-group-2\lab-resource-utilization"
./mvnw clean package -DskipTests
```
**Expected Output:** `BUILD SUCCESS` + JAR file in `target/` folder

### **Test Frontend Build:**
```powershell
cd "c:\Users\PRIYA DHARSHINI\Desktop\intern 2\lab-resource-utilization-platform-group-2\lab-resource-utilization\frontend"
npm install
npm run build
```
**Expected Output:** `Build successful` + files in `dist/` folder

---

## 🧪 **STEP 5: POST-DEPLOYMENT TESTING**

### **1. Test Backend Health:**
```bash
curl https://your-backend-url.com/auth/health
```
**Expected:** HTTP 200 or error page (depends on endpoint config)

### **2. Test Frontend Load:**
- Open: `https://your-frontend-url.com`
- **Expected:** Login page loads without console errors

### **3. Complete User Flow Test:**

**A. Registration:**
1. Click "Sign Up"
2. Enter email address
3. Click "Send OTP"
4. Check email inbox for OTP code
5. Enter OTP and complete registration
6. **Expected:** Account created successfully

**B. Login:**
1. Enter registered email and password
2. Click "Login"
3. **Expected:** Redirect to dashboard

**C. Equipment Management:**
1. Navigate to Equipment List
2. Add new equipment
3. **Expected:** Equipment appears in list

**D. Booking Flow:**
1. Select equipment
2. Create booking request
3. **Expected:** Booking confirmation

**E. Maintenance Request:**
1. Submit maintenance request for equipment
2. **Expected:** Request created successfully

### **4. Check Database Tables:**
- Login to Neon.tech dashboard
- SQL Editor → Run: `SELECT * FROM users;`
- **Expected:** See registered users

---

## 🔐 **SECURITY CHECKLIST**

✅ **DO:**
- Use environment variables for all secrets
- Enable `sslmode=require` for database connections
- Use strong passwords (min 16 characters)
- Keep `.env` files out of Git
- Enable HTTPS for production (Render/Railway auto-provides)
- Use Gmail App Passwords (not account password)

❌ **DON'T:**
- Hardcode passwords in `application.properties`
- Commit sensitive data to GitHub
- Disable CORS completely
- Use default/weak passwords
- Share production credentials

---

## 📊 **MONITORING & LOGS**

### **Render.com:**
- Go to your service → "Logs" tab
- Real-time log streaming available
- Download logs for troubleshooting

### **Railway.app:**
- Click on service → "Deployments" tab → "View Logs"
- Metrics dashboard shows CPU/Memory usage

### **Database Monitoring:**
- **Neon:** Dashboard shows connection count, storage usage
- **Supabase:** Table Editor + Query Editor

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: CORS Error in Browser Console**
**Symptom:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Update `SecurityConfig.java` with your production frontend URL
2. Commit and push to GitHub
3. Redeploy backend

### **Issue 2: Email Not Sending**
**Symptom:** OTP emails not received

**Solution:**
1. Verify Gmail App Password is correct (16 characters, no spaces)
2. Check spam folder
3. Verify `MAIL_USERNAME` and `MAIL_PASSWORD` environment variables
4. Check backend logs for email errors

### **Issue 3: Database Connection Failed**
**Symptom:** Backend logs show `Unable to acquire JDBC Connection`

**Solution:**
1. Verify `DB_URL` includes `?sslmode=require`
2. Check database is running (Neon dashboard)
3. Verify username/password are correct
4. Check database accepts connections from Render IP ranges

### **Issue 4: Build Fails on Render**
**Symptom:** Deployment stuck at "Building..."

**Solution:**
1. Check build logs for specific error
2. Verify `mvnw` has execute permissions: `chmod +x mvnw`
3. Ensure Java 21 is selected in Render settings
4. Try building locally first

### **Issue 5: Frontend Shows Blank Page**
**Symptom:** White screen, no errors

**Solution:**
1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly
3. Check network tab for failed API requests
4. Verify backend is running and accessible

---

## 📝 **DEPLOYMENT SUMMARY**

### **Your Production URLs:**
- **Frontend:** `https://lab-frontend.onrender.com`
- **Backend:** `https://lab-backend.onrender.com`
- **Database:** `Neon.tech` (serverless PostgreSQL)

### **Environment Variables (Total: 9)**
**Backend (8):**
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `APP_BASE_URL`

**Frontend (1):**
- `VITE_API_URL`

### **Build Commands:**
- **Backend:** `./mvnw clean package -DskipTests`
- **Frontend:** `npm install && npm run build`

### **Start Commands:**
- **Backend:** `java -Dserver.port=$PORT -jar target/*.jar`
- **Frontend:** Static site (serves `dist/` folder)

---

## 🎯 **CUSTOM DOMAIN (Optional)**

### **Add Custom Domain to Render:**
1. Go to your service → "Settings" → "Custom Domain"
2. Add your domain (e.g., `labplatform.com`)
3. Update DNS records as instructed by Render
4. SSL certificate auto-provisioned

### **Update Environment Variables:**
- Update `APP_BASE_URL` on backend
- Update CORS allowed origins in `SecurityConfig.java`

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Render Documentation:**
- https://render.com/docs
- Community Forum: https://community.render.com

### **Railway Documentation:**
- https://docs.railway.app

### **Neon Database Docs:**
- https://neon.tech/docs

### **Check Application Logs:**
- Backend logs show all API requests and errors
- Look for stack traces to identify issues

---

## ✅ **FINAL DEPLOYMENT CHECKLIST**

- [ ] Database created on Neon.tech
- [ ] Gmail App Password generated
- [ ] Backend deployed on Render with all 8 environment variables
- [ ] Frontend deployed on Render with `VITE_API_URL`
- [ ] CORS updated in `SecurityConfig.java` with production URL
- [ ] Backend redeployed after CORS update
- [ ] Tested signup with OTP email
- [ ] Tested login flow
- [ ] Tested equipment management
- [ ] Tested booking creation
- [ ] Tested maintenance requests
- [ ] All dashboard pages load correctly
- [ ] No console errors in browser
- [ ] Email notifications working
- [ ] Database tables created automatically

---

## 🎉 **CONGRATULATIONS!**

Your **Lab Resource Utilization Platform** is now **LIVE IN PRODUCTION**! 🚀

Share your deployment URL with your team and start managing lab resources efficiently!

---

**Deployment Date:** January 2026  
**Branch Deployed:** main  
**Total Features:** 10+ modules  
**Tech Stack:** Spring Boot 4.1 + React 19.2 + PostgreSQL  
