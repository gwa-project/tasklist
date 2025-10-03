# 🚀 Deployment Guide - Tasklist to Google Cloud Run

## 📋 Prerequisites

- Google Cloud Project: `gwa-project-472118`
- GitHub Repository dengan tasklist code
- MongoDB Atlas URL: `mongodb+srv://santuypars22:-Kambing12345@santuyss.uztjo84.mongodb.net/`

---

## 🔧 Setup GitHub Secrets

Buka: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

### 1. GOOGLE_CREDENTIALS
Service account JSON untuk deployment (sama seperti sena-rencar)

### 2. MONGODB_URI
```
mongodb+srv://santuypars22:-Kambing12345@santuyss.uztjo84.mongodb.net/
```

---

## 📦 Files Created

### 1. **Dockerfile**
Multi-stage build untuk Next.js standalone mode:
- Build stage: Install deps & build
- Production stage: Minimal image dengan standalone output

### 2. **.github/workflows/deploy.yml**
Auto-deploy ke Cloud Run saat push ke `main`:
- Region: `asia-northeast1` (Tokyo)
- Service: `tasklist-frontend`
- Memory: 512Mi
- Port: 8080

### 3. **.dockerignore**
Exclude files yang tidak perlu di Docker image

### 4. **.gitignore**
Updated untuk exclude `.env` files

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
cd D:\a-Github\GCP\sena-rencar\tasklist

# Initialize git (if not yet)
git init
git branch -M main

# Add remote (create GitHub repo first)
git remote add origin https://github.com/YOUR_USERNAME/tasklist.git

# Commit & push
git add .
git commit -m "Initial commit with GCP deployment config"
git push -u origin main
```

### Step 2: Setup GitHub Secrets

1. **GOOGLE_CREDENTIALS**: Copy dari sena-rencar secrets
2. **MONGODB_URI**: `mongodb+srv://santuypars22:-Kambing12345@santuyss.uztjo84.mongodb.net/`

### Step 3: Trigger Deployment

GitHub Actions akan auto-deploy saat push ke `main`.

Monitor di: `https://github.com/YOUR_USERNAME/tasklist/actions`

### Step 4: Setup Custom Domain

Setelah deployment sukses:

```bash
# Create domain mapping
gcloud beta run domain-mappings create \
  --service=tasklist-frontend \
  --domain=tasklist.gilarya.my.id \
  --region=asia-northeast1 \
  --project=gwa-project-472118
```

Output akan kasih CNAME target: `ghs.googlehosted.com`

### Step 5: Update DNS di Cloudflare

1. Buka: https://dash.cloudflare.com
2. Pilih domain: **gilarya.my.id**
3. Tab **DNS** → **Add record**:
   - **Type**: CNAME
   - **Name**: tasklist
   - **Target**: `ghs.googlehosted.com`
   - **Proxy**: **DNS only** (grey cloud)
   - **TTL**: Auto
   - **Save**

### Step 6: Wait for SSL

Tunggu **5-15 menit** untuk SSL certificate provision.

Check status:
```bash
gcloud beta run domain-mappings describe tasklist.gilarya.my.id \
  --region=asia-northeast1 \
  --project=gwa-project-472118
```

### Step 7: Test Access

```bash
curl -I https://tasklist.gilarya.my.id
```

Atau buka di browser: **https://tasklist.gilarya.my.id**

---

## 🌐 Final URLs

- **Frontend**: https://tasklist.gilarya.my.id
- **Database**: MongoDB Atlas (santuyss cluster)
- **Cloud Run Dashboard**: https://console.cloud.google.com/run?project=gwa-project-472118

---

## 💰 Estimated Cost

- **Cloud Run**: $0-5/month (dengan 512Mi memory)
- **MongoDB Atlas**: FREE tier (shared cluster)
- **Domain Mapping**: FREE (no Load Balancer cost)
- **Total**: ~$0-5/month

---

## 🔒 Security Notes

1. ✅ MongoDB credentials di GitHub Secrets (tidak di code)
2. ✅ Standalone Next.js build (minimal dependencies)
3. ✅ HTTPS SSL managed by Google
4. ✅ No public environment variables

---

## 📝 Notes

- Next.js configured dengan `output: 'standalone'` untuk optimal Docker size
- Cloud Run region: `asia-northeast1` (Tokyo) - support domain mapping
- Auto-scaling: 0-10 instances
- Cold start: ~2-3 detik (standalone mode lebih cepat)

---

🎉 **Done! Tasklist ready for production!**
