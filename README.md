# Task Manager dengan Audit Log

Aplikasi ini menggunakan arsitektur Client–Server yang terpisah:

Frontend: React
Backend: Express.js
Database: MySQL
ORM: Prisma

Frontend mengelola antarmuka pengguna serta menentukan pengguna yang sedang aktif melalui React Context. Backend secara otomatis mencatat seluruh aktivitas ke dalam audit log.

---

# Installasi

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 2. Jalankan Database

Pastikan salah satu web server/database berikut sudah berjalan:

XAMPP
Laragon
atau web server lainnya

Kemudian buat database baru dengan nama:

```text
task_manager
```

---

## 3. Setup Backend

Masuk ke folder server.

```bash
cd server
```

Install dependency.

```bash
npm install
```

Apabila proses install berhenti (stuck), gunakan:

```bash
npm install --verbose
```

Ubah file:

```text
.env.example
```

menjadi

```text
.env
```

Kemudian sesuaikan konfigurasi database:

```env
DATABASE_URL="mysql://username:password@localhost:3306/task_manager"
```

Sesuaikan:

username
password
port database
nama database

---

## 4. Jalankan Migration

```bash
npx prisma migrate dev
```

Generate Prisma Client.

```bash
npx prisma generate
```

Seed database.

```bash
npx prisma db seed
```

Jalankan backend.

```bash
npm start
```

---

## 5. Setup Frontend

Masuk ke folder frontend.

```bash
cd task-manager
```

Install dependency.

```bash
npm install
```

Jalankan aplikasi.

```bash
npm run dev
```

---

# Architecture

```text
React (Frontend) -> React Context (User saat ini) -> Express API -> Prisma ORM -> MySQL Database
```

### Frontend

Menampilkan UI.
Mengelola state.
Mengelola user saat ini menggunakan React Context.
Mengirim request ke backend.

### Backend

Menyimpan task.
Mencatat seluruh perubahan ke Audit Log secara otomatis.

---

# Audit Log

Setiap perubahan status task akan dicatat secara otomatis.

Informasi yang disimpan meliputi:

User
Task
Status sebelumnya
Status baru
Waktu perubahan

---

# Perbaikan


Ketika sebuah task dihapus data audit log masih tetap tersimpan. Tapi karena audit log saat ini hanya menyimpan id task, maka nama task tidak lagi dapat ditampilkan setelah task tersebut dihapus.

Perbaikan nantinya adalah dengan menyimpan informasi penting seperti nama task ke dalam audit log sehingga riwayat aktivitas tetap dapat dibaca meskipun task sudah tidak ada di database.

---

# Penggunaan AI

AI digunakan pada beberapa bagian pengembangan proyek ini, yaitu:

Membantu pembuatan dan penyempurnaan UI karena UI tidak menjadi aspek penilaian utama.
Membantu proses konfigurasi Prisma ORM karea terdapat error pada konfigurasi Prisma ORM.
