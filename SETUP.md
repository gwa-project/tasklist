# 🚀 Setup Guide - Project Tasklist

## ✅ Sudah Diimplementasikan

### 🔐 **Authentication System**
- ✅ User registration & login
- ✅ JWT session management dengan cookies
- ✅ Password hashing dengan bcrypt
- ✅ Protected routes & API
- ✅ User menu dengan logout

### 🎨 **Modern UI**
- ✅ Beautiful glassmorphism design
- ✅ Login & Register pages
- ✅ Dashboard dengan user menu
- ✅ Responsive design
- ✅ Dark theme dengan gradient effects

### 🔒 **Security**
- ✅ Middleware protection untuk semua routes
- ✅ API routes hanya bisa diakses user yang login
- ✅ Project & Task tied to user account
- ✅ HTTP-only cookies untuk session

---

## ⚙️ Environment Variables

### **GitHub Repository Secrets**

Pastikan secrets berikut sudah ada di GitHub Repository Settings:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `MONGOSTRING` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PRKEY` | JWT secret key (hex format) | `your-hex-key-from-github` |

### **Local Development (.env.local)**

```bash
# MongoDB Connection String
MONGOSTRING=mongodb+srv://santuypars22:-Kambing12345@santuyss.uztjo84.mongodb.net/gogcp?retryWrites=true&w=majority

# JWT Secret (copy dari GitHub Secret PRKEY)
PRKEY=your-hex-prkey-from-github-secret

# Node Environment
NODE_ENV=development
```

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🗄️ Database Structure

### **Collections:**

#### 1. **users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  picture: String (optional),
  google_id: String (optional),
  role: String (enum: 'admin', 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **projects**
```javascript
{
  _id: ObjectId,
  name: String,
  status: String (enum: 'draft', 'in_progress', 'done'),
  progress: Number (0-100, 1 decimal),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **tasks**
```javascript
{
  _id: ObjectId,
  name: String,
  status: String (enum: 'draft', 'in_progress', 'done'),
  project: ObjectId (ref: Project),
  weight: Number (min: 1),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

### **Register**
1. User mengisi form di `/register`
2. POST ke `/api/auth/register`
3. Password di-hash dengan bcrypt
4. User disimpan ke database
5. Session dibuat otomatis (auto-login)
6. Redirect ke dashboard `/`

### **Login**
1. User mengisi form di `/login`
2. POST ke `/api/auth/login`
3. Verifikasi email & password
4. Session dibuat dengan JWT
5. Cookie HTTP-only di-set
6. Redirect ke dashboard `/`

### **Logout**
1. User klik logout di UserMenu
2. POST ke `/api/auth/logout`
3. Session cookie dihapus
4. Redirect ke `/login`

### **Protection**
- Middleware check session untuk semua routes kecuali `/login` & `/register`
- API routes check session dan filter data by userId
- User hanya bisa akses data miliknya sendiri

---

## 🌐 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### **Projects** (Protected)
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### **Tasks** (Protected)
- `GET /api/tasks?projectId=:id` - Get tasks by project
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

---

## 🎯 Features

### ✅ **Auto Progress Calculation**
Progress dihitung otomatis berdasarkan bobot task yang selesai:
```
progress = (completedWeight / totalWeight) * 100
// Rounded down to 1 decimal
```

### ✅ **Auto Status Update**
Status project update otomatis berdasarkan status tasks:
- **draft**: Tidak ada task atau semua task draft
- **in_progress**: Ada minimal 1 task in_progress
- **done**: Semua task sudah done

---

## 🧪 Testing

### **Manual Testing Steps:**

1. **Register New User**
   - Buka `/register`
   - Isi nama, email, password
   - Klik "Daftar Sekarang"
   - ✅ Harus auto-login dan redirect ke dashboard

2. **Login**
   - Logout dulu
   - Buka `/login`
   - Isi email & password
   - ✅ Harus redirect ke dashboard

3. **Create Project**
   - Klik "Project Baru"
   - Isi nama project
   - ✅ Project muncul di sidebar

4. **Create Task**
   - Pilih project
   - Klik "Task Baru"
   - Isi nama, status, bobot
   - ✅ Task muncul di task board
   - ✅ Progress project terupdate

5. **Update Task Status**
   - Klik task untuk edit
   - Ubah status ke "done"
   - ✅ Progress project naik
   - ✅ Status project berubah jika perlu

6. **Logout**
   - Klik avatar di kanan atas
   - Klik "Logout"
   - ✅ Redirect ke login page

7. **Protection Test**
   - Logout dulu
   - Coba akses `http://localhost:3000/`
   - ✅ Harus redirect ke `/login`

---

## 🚨 Troubleshooting

### **Error: MONGODB_URI not defined**
- Pastikan file `.env.local` ada
- Pastikan `MONGOSTRING` atau `MONGODB_URI` terisi
- Restart dev server: `npm run dev`

### **Error: JWT verification failed**
- Pastikan `PRKEY` atau `JWT_SECRET` terisi
- Clear browser cookies
- Login ulang

### **Cannot connect to MongoDB**
- Cek connection string di `.env.local`
- Cek MongoDB cluster status
- Cek IP whitelist di MongoDB Atlas

### **Session tidak tersimpan**
- Pastikan browser accept cookies
- Cek console untuk errors
- Clear cache & cookies browser

---

## 📝 Notes

- User data dipisah per account (multi-tenant ready)
- Password di-hash dengan bcrypt (salt rounds: 10)
- Session expire dalam 7 hari
- HTTP-only cookies untuk security
- Auto-logout jika session expired

---

## 🎉 Selesai!

Semua fitur sudah terimplementasi dengan baik. Silakan test dan kabari jika ada error! 🚀
