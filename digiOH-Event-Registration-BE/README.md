# digiOH Event Registration - Backend

Backend API untuk sistem registrasi event digiOH. Dibangun menggunakan **Express.js** dengan database **PostgreSQL** dan ORM **Sequelize**.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi Database](#-konfigurasi-database)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Deployment ke Server](#-deployment-ke-server)
- [API Endpoints](#-api-endpoints)
- [Struktur Folder](#-struktur-folder)

## 🚀 Fitur

- Manajemen tamu (CRUD)
- Generate QR Code untuk undangan
- Import/Export data tamu dari Excel
- Sistem konfirmasi kehadiran
- Tracking merchandise
- Multi-event support
- Autentikasi JWT

## 🛠 Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js v4
- **Database**: PostgreSQL v14+
- **ORM**: Sequelize v6
- **QR Code**: qrcode
- **Excel**: exceljs, xlsx

## 📦 Prasyarat

Pastikan Anda sudah menginstall:

1. **Node.js** v18 atau lebih baru
   ```bash
   node --version
   ```

2. **PostgreSQL** v14 atau lebih baru
   ```bash
   psql --version
   ```

3. **npm** atau **yarn**
   ```bash
   npm --version
   ```

## 🔧 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/your-username/digiOH-Event-Registration-BE.git
cd digiOH-Event-Registration-BE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root folder:

```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi Anda:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DATABASE=digioh_event

# Server Configuration
PORT=5000
BASE_URL=http://localhost:5000

# JWT Secret (untuk autentikasi)
JWT_SECRET=your_super_secret_key_here
```

## 💾 Konfigurasi Database

### 1. Buat Database PostgreSQL

Login ke PostgreSQL dan buat database:

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database baru
CREATE DATABASE digioh_event;

# Keluar
\q
```

Atau menggunakan command line:

```bash
createdb -U postgres digioh_event
```

### 2. Test Koneksi Database

Jalankan script test koneksi:

```bash
node db_test_script.js
```

Output yang diharapkan:

```
Attempting to connect to 127.0.0.1 on port 5432...
Connection has been established successfully.
Tables: [ 'guests', 'users', 'events', 'attrs' ]
```

### 3. Sinkronisasi Model

Tabel akan otomatis dibuat saat aplikasi pertama kali dijalankan karena menggunakan `sequelize.sync({ alter: true })`.

## ▶️ Menjalankan Aplikasi

### Development Mode

```bash
node src/index.js
```

Server akan berjalan di `http://localhost:5000`

### Dengan PM2 (Recommended untuk Production)

```bash
# Install PM2 secara global
npm install -g pm2

# Jalankan aplikasi
pm2 start src/index.js --name "digioh-backend"

# Lihat status
pm2 status

# Lihat logs
pm2 logs digioh-backend

# Restart aplikasi
pm2 restart digioh-backend

# Stop aplikasi
pm2 stop digioh-backend
```

## 🚀 Deployment ke Server

### 1. Persiapan Server (Ubuntu/Debian)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### 2. Setup PostgreSQL di Server

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Buat user baru (ganti password sesuai kebutuhan)
CREATE USER digioh_user WITH PASSWORD 'your_secure_password';

# Buat database
CREATE DATABASE digioh_event OWNER digioh_user;

# Berikan privileges
GRANT ALL PRIVILEGES ON DATABASE digioh_event TO digioh_user;

# Keluar
\q
```

### 3. Clone dan Setup Aplikasi

```bash
# Clone repository
cd /var/www
git clone https://github.com/your-username/digiOH-Event-Registration-BE.git
cd digiOH-Event-Registration-BE

# Install dependencies
npm install --production

# Buat file .env
nano .env
```

Isi `.env` dengan konfigurasi production:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=digioh_user
DB_PASSWORD=your_secure_password
DATABASE=digioh_event

PORT=5000
BASE_URL=https://your-domain.com

JWT_SECRET=your_very_long_and_secure_secret_key
```

### 4. Jalankan dengan PM2

```bash
# Start aplikasi
pm2 start src/index.js --name "digioh-backend"

# Setup auto-start saat server reboot
pm2 startup
pm2 save
```

### 5. Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install -y nginx

# Buat konfigurasi
sudo nano /etc/nginx/sites-available/digioh-backend
```

Isi konfigurasi:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktifkan konfigurasi
sudo ln -s /etc/nginx/sites-available/digioh-backend /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. Setup SSL dengan Certbot (Optional tapi Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d api.your-domain.com
```

### 7. Update Aplikasi

Ketika ada update baru:

```bash
cd /var/www/digiOH-Event-Registration-BE

# Pull perubahan terbaru
git pull origin main

# Install dependencies baru (jika ada)
npm install --production

# Restart aplikasi
pm2 restart digioh-backend
```

## 📡 API Endpoints

### Guest Routes

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/guests/:event_id` | Ambil semua tamu per event |
| GET | `/api/guest/:guest_id` | Detail tamu (JSON) |
| GET | `/api/guest/:unique_code` | Halaman QR tamu (HTML) |
| POST | `/api/guest` | Tambah tamu baru |
| PUT | `/api/guest/:id` | Update atribut tamu |
| PUT | `/api/guest/:id/confirmation` | Update status konfirmasi |
| PUT | `/api/guest/:id/attendance` | Update status kehadiran |
| PUT | `/api/guest/:id/merchandise` | Update status merchandise |
| DELETE | `/api/guest/:id` | Hapus tamu |
| POST | `/api/guests/import` | Import dari Excel |
| POST | `/api/guests/export` | Export ke Excel |
| GET | `/api/guests/template` | Download template Excel |

### Event Routes

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/events` | Ambil semua event |
| POST | `/api/event` | Buat event baru |
| PUT | `/api/event/:id` | Update event |
| DELETE | `/api/event/:id` | Hapus event |

### User Routes

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/login` | Login user |
| POST | `/api/register` | Register user |

## 📁 Struktur Folder

```
digiOH-Event-Registration-BE/
├── public/                  # Static files (background QR, dll)
├── src/
│   ├── config/
│   │   └── config.js        # Konfigurasi database
│   ├── controllers/
│   │   ├── guest.js         # Logic untuk guest
│   │   ├── user.js          # Logic untuk user
│   │   └── event.js         # Logic untuk event
│   ├── middlewares/
│   │   └── auth.js          # JWT authentication
│   ├── models/
│   │   ├── index.js         # Setup Sequelize + relasi
│   │   ├── Guest.js         # Model Guest
│   │   ├── User.js          # Model User
│   │   ├── Event.js         # Model Event
│   │   └── Attribute.js     # Model atribut dinamis
│   ├── routes/
│   │   ├── guest.js         # Routes guest
│   │   ├── user.js          # Routes user
│   │   └── event.js         # Routes event
│   ├── services/
│   │   ├── generateQR.js    # Generate QR Code
│   │   ├── exportExcel.js   # Export ke Excel
│   │   └── importExcel.js   # Import dari Excel
│   └── index.js             # Entry point aplikasi
├── tests/                   # Unit tests
├── uploads/                 # Temporary upload folder
├── .env                     # Environment variables
├── .gitignore
├── db_test_script.js        # Script test koneksi DB
├── package.json
└── README.md
```

## 🧪 Testing

Jalankan unit tests:

```bash
npm test
```

## 📝 License

ISC License

## 🤝 Contributing

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request
