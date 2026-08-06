# ☁️ Cloud PostgreSQL Database Setup Guide

This guide walks you through setting up a free **Cloud PostgreSQL Database** and integrating it with your Spring Boot Backend (`lab-resource-utilization`).

---

## ⚡ Option 1: Neon Tech (Recommended — Fast & Free)

[Neon.tech](https://neon.tech) provides a fully managed, serverless PostgreSQL database with a generous free tier (0 credit card required).

### Step 1: Create a Free Account & Project
1. Go to [https://neon.tech](https://neon.tech) and click **Sign Up** (or login with GitHub / Google).
2. Click **Create Project**.
3. Name your project (e.g. `lab-resource-db`) and choose a cloud region (e.g., AWS `us-east-1` or `eu-central-1`).
4. Click **Create Project**.

### Step 2: Get Your Connection Details
After project creation, Neon displays your **Database Details** or **Connection String**:

- Look for the **Connection Details** box:
  - **Host**: `ep-xyz-12345.us-east-1.aws.neon.tech`
  - **Database**: `neondb`
  - **User**: `neondb_owner` (or your created username)
  - **Password**: `YourGeneratedPassword`

- Or select **Java / Spring Boot** / **JDBC** from the connection dropdown. Your JDBC URL will look like:
  ```text
  jdbc:postgresql://ep-xyz-12345.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```

---

## ⚡ Option 2: Supabase (Alternative)

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project**.
2. Click **New Project**, specify a project name and database password.
3. Once created, go to **Project Settings** → **Database**.
4. Under **Connection string** -> **JDBC**, copy your URL:
  ```text
  jdbc:postgresql://db.xxxx.supabase.co:5432/postgres?sslmode=require
  ```

---

## ⚙️ Step 3: Configure Spring Boot Application

Your `application.properties` has been pre-configured to accept environment variables:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/postgres}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=update
```

### Method A: Set Environment Variables (Recommended for local dev & deployment)
In your terminal / PowerShell before running the Spring Boot application:

#### PowerShell:
```powershell
$env:DB_URL="jdbc:postgresql://ep-xyz-12345.us-east-1.aws.neon.tech/neondb?sslmode=require"
$env:DB_USERNAME="neondb_owner"
$env:DB_PASSWORD="your-neon-password"
.\mvnw.cmd spring-boot:run
```

#### CMD / Bash:
```bash
export DB_URL="jdbc:postgresql://ep-xyz-12345.us-east-1.aws.neon.tech/neondb?sslmode=require"
export DB_USERNAME="neondb_owner"
export DB_PASSWORD="your-neon-password"
./mvnw spring-boot:run
```

### Method B: Update `application.properties` Directly
If you prefer putting credentials directly in [application.properties](file:///c:/Users/HP/OneDrive/Desktop/lab-resource-utilization-platform-group-2/lab-resource-utilization-platform-group-2/lab-resource-utilization/src/main/resources/application.properties):

```properties
spring.datasource.url=jdbc:postgresql://ep-xyz-12345.us-east-1.aws.neon.tech/neondb?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.password=your-neon-password
```

---

## 🧪 Step 4: Verify Connection & Automatic Table Creation

1. When you run `.\mvnw.cmd spring-boot:run`, Spring Boot with Hibernate (`ddl-auto=update`) will automatically create all tables (`users`, `equipment`, `lab_reservations`, `maintenance_requests`, `notifications`, etc.) on your cloud database!
2. You can check the tables directly in the **Neon Dashboard SQL Editor** or **Supabase Table Editor**.

---

## 🚀 Quick Checklist
- [x] `application.properties` updated to support `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
- [ ] Create free database on Neon.tech or Supabase.
- [ ] Set database environment variables or update `application.properties`.
- [ ] Launch application using `.\mvnw.cmd spring-boot:run` to initialize tables.
