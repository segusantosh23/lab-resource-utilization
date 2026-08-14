# ⚡ QUICK DEPLOYMENT REFERENCE CARD

## 🎯 MAIN BRANCH - READY FOR PRODUCTION DEPLOYMENT

---

## 📦 PROJECT SUMMARY
- **Branch:** `main` ✅ (Complete full-stack app)
- **Backend:** Spring Boot 4.1.0 + Java 21 + PostgreSQL
- **Frontend:** React 19.2.7 + Vite 8.1.1 + TailwindCSS
- **Total Files:** 213+ files
- **Lines of Code:** 37,574+ lines

---

## 🚀 FASTEST DEPLOYMENT (Render.com - 15 minutes)

### **Step 1: Database (2 minutes)**
1. Go to https://neon.tech → Sign up
2. Create project → Copy connection string
3. Save: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`

### **Step 2: Email (3 minutes)**
1. Gmail → Security → 2-Factor Auth → App Passwords
2. Generate password → Save: `MAIL_USERNAME`, `MAIL_PASSWORD`

### **Step 3: Backend (5 minutes)**
1. https://render.com → New Web Service
2. Connect GitHub repo
3. Config:
   - Branch: `main`
   - Root: `lab-resource-utilization`
   - Build: `./mvnw clean package -DskipTests`
   - Start: `java -Dserver.port=$PORT -jar target/*.jar`
4. Add 8 environment variables (from Step 1 & 2)
5. Deploy → Copy backend URL

### **Step 4: Frontend (5 minutes)**
1. Render → New Static Site
2. Same repo
3. Config:
   - Branch: `main`
   - Root: `lab-resource-utilization/frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
4. Add: `VITE_API_URL=<backend-url>`
5. Deploy → Copy frontend URL

### **Step 5: Update CORS (2 minutes)**
1. Edit: `src/main/java/.../config/SecurityConfig.java`
2. Add frontend URL to `allowedOrigins`
3. Push to GitHub → Auto-redeploys

---

## 📋 REQUIRED ENVIRONMENT VARIABLES (9 Total)

### **Backend (8):**
```
DB_URL=jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=<neon-password>
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=youremail@gmail.com
MAIL_PASSWORD=<16-char-app-password>
APP_BASE_URL=https://your-frontend.onrender.com
```

### **Frontend (1):**
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🧪 BUILD COMMANDS (Test Locally First)

### **Backend:**
```powershell
cd lab-resource-utilization
./mvnw clean package -DskipTests
```
✅ **Expected:** `BUILD SUCCESS` + JAR in `target/`

### **Frontend:**
```powershell
cd lab-resource-utilization\frontend
npm install
npm run build
```
✅ **Expected:** Build complete + files in `dist/`

---

## ✅ DEPLOYMENT PLATFORMS COMPARISON

| Platform | Backend | Frontend | Database | Free Tier | Setup Time |
|----------|---------|----------|----------|-----------|------------|
| **Render.com** | ✅ Web Service | ✅ Static Site | ❌ (Use Neon) | ✅ 750hrs/month | 15 min |
| **Railway.app** | ✅ | ✅ | ✅ Built-in | ✅ $5/month free | 12 min |
| **Vercel + Render** | ✅ Render | ✅ Vercel | ❌ (Use Neon) | ✅ Generous | 18 min |

**Recommendation:** Render.com (Easiest, No credit card needed)

---

## 🐛 QUICK TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| **CORS Error** | Update SecurityConfig.java with production URL |
| **Email Not Sending** | Check Gmail App Password (16 chars, no spaces) |
| **DB Connection Failed** | Verify `?sslmode=require` in DB_URL |
| **Build Fails** | Test locally first with commands above |
| **Blank Page** | Check `VITE_API_URL` and browser console |

---

## 📞 TESTING CHECKLIST

After deployment, test:
- [ ] Open frontend URL → Login page loads
- [ ] Sign up → Receive OTP email
- [ ] Login → Dashboard loads
- [ ] Equipment List → Shows data
- [ ] Create Booking → Success
- [ ] Maintenance Request → Creates successfully

---

## 🎯 ONE-COMMAND LOCAL RUN (For Reference)

### **Backend:**
```powershell
cd lab-resource-utilization
./mvnw spring-boot:run
```
Runs on: http://localhost:8081

### **Frontend:**
```powershell
cd lab-resource-utilization\frontend
npm run dev
```
Runs on: http://localhost:5173

---

## 🔗 USEFUL LINKS

- **Render.com:** https://render.com
- **Neon Database:** https://neon.tech
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Full Guide:** See `DEPLOYMENT_GUIDE.md`

---

## 📝 NOTES

- Main branch is production-ready ✅
- All 213 files from dev merged successfully
- No localhost URLs in production config (uses env vars)
- CORS configured for localhost + production
- Database schema auto-created on first run
- Free tier sufficient for testing/demo

---

**Ready to Deploy! Follow the 5 steps above.** 🚀
