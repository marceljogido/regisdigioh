# digiOH Event Registration - Frontend

Frontend aplikasi untuk sistem registrasi event digiOH. Dibangun menggunakan **React.js** dengan **TypeScript** dan **Material-UI**.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Build Production](#-build-production)
- [Deployment ke Server](#-deployment-ke-server)
- [Struktur Folder](#-struktur-folder)

## 🚀 Fitur

- Dashboard manajemen event
- Daftar dan filter tamu
- QR Code Scanner untuk kehadiran
- QR Code Scanner untuk merchandise
- Import/Export data tamu (Excel)
- Halaman konfirmasi kehadiran
- Responsive design (mobile-friendly)
- Dark mode scanner UI

## 🛠 Tech Stack

- **Framework**: React.js v18
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Styling**: TailwindCSS, Styled Components
- **State Management**: React Context
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **QR Scanner**: qr-scanner
- **Animations**: Framer Motion

## 📦 Prasyarat

Pastikan Anda sudah menginstall:

1. **Node.js** v18 atau lebih baru
   ```bash
   node --version
   ```

2. **npm** atau **yarn**
   ```bash
   npm --version
   ```

3. **Backend API** sudah berjalan (lihat README backend)

## 🔧 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/your-username/digiOH-Event-Registration-FE.git
cd digiOH-Event-Registration-FE
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

Edit file `.env`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Optional: Analytics, etc.
REACT_APP_GA_ID=UA-XXXXXXXXX-X
```

## ⚙️ Konfigurasi

### Konfigurasi API

Edit file `src/api/guestApi.ts` atau sesuaikan `REACT_APP_API_URL` di file `.env`:

```typescript
// Default API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Konfigurasi Routes

Routes aplikasi didefinisikan di `src/routes/routes.tsx`:

| Path | Halaman | Deskripsi |
|------|---------|-----------|
| `/` | Login | Halaman login |
| `/dashboard` | Dashboard | Overview event |
| `/event/:id` | EventData | Daftar tamu per event |
| `/scan` | ScanQR | Scanner kehadiran |
| `/scan-merchandise` | ScanMerchandise | Scanner merchandise |
| `/confirm/:code` | ConfirmAttendance | Konfirmasi kehadiran |
| `/confirm-merchandise/:code` | ConfirmMerchandise | Konfirmasi merchandise |

## ▶️ Menjalankan Aplikasi

### Development Mode

```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

### Dengan Port Berbeda

```bash
PORT=3001 npm start
```

## 📦 Build Production

### Build Static Files

```bash
npm run build
```

Hasil build akan ada di folder `build/`

### Test Build Locally

```bash
# Install serve globally
npm install -g serve

# Jalankan build
serve -s build -l 3000
```

## 🚀 Deployment ke Server

### Opsi 1: Static Hosting (Nginx)

#### 1. Build Aplikasi

```bash
npm run build
```

#### 2. Upload ke Server

```bash
# Upload folder build ke server
scp -r build/* user@your-server:/var/www/digioh-frontend
```

#### 3. Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/digioh-frontend
```

Isi konfigurasi:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/digioh-frontend;
    index index.html;

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
# Aktifkan konfigurasi
sudo ln -s /etc/nginx/sites-available/digioh-frontend /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. Setup SSL

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Opsi 2: Vercel (Recommended untuk kemudahan)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
# Login ke Vercel
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

#### 3. Set Environment Variables di Vercel

Di Vercel Dashboard:
1. Pilih project
2. Settings → Environment Variables
3. Tambahkan `REACT_APP_API_URL` dengan nilai API production

### Opsi 3: Netlify

#### 1. Build Settings di Netlify

- **Build command**: `npm run build`
- **Publish directory**: `build`

#### 2. Redirect untuk SPA

Buat file `public/_redirects`:

```
/*    /index.html   200
```

### Opsi 4: PM2 + Serve (untuk VPS)

```bash
# Install dependencies
npm install -g serve pm2

# Build aplikasi
npm run build

# Jalankan dengan PM2
pm2 start serve --name "digioh-frontend" -- -s build -l 3000

# Auto-start saat reboot
pm2 startup
pm2 save
```

## 🔄 Update Aplikasi di Server

### Dengan Git + Nginx

```bash
cd /var/www/digioh-frontend-source

# Pull perubahan
git pull origin main

# Install dependencies baru
npm install

# Build ulang
npm run build

# Copy ke direktori Nginx
cp -r build/* /var/www/digioh-frontend/
```

### Script Auto-Deploy (Optional)

Buat file `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building..."
npm run build

echo "🚀 Deploying..."
cp -r build/* /var/www/digioh-frontend/

echo "✅ Deployment complete!"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📁 Struktur Folder

```
digiOH-Event-Registration-FE/
├── public/
│   ├── index.html           # HTML template
│   ├── favicon.ico
│   └── _redirects           # Untuk Netlify SPA
├── src/
│   ├── api/
│   │   ├── guestApi.ts      # API calls untuk guest
│   │   ├── eventApi.ts      # API calls untuk event
│   │   └── userApi.ts       # API calls untuk user
│   ├── assets/
│   │   └── images/          # Gambar dan icons
│   ├── components/
│   │   ├── AddGuestDialog.tsx
│   │   ├── UpdateGuestDialog.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...              # Komponen UI lainnya
│   ├── context/
│   │   └── AuthContext.tsx  # State autentikasi
│   ├── layout/
│   │   └── MainLayout.tsx   # Layout utama dengan sidebar
│   ├── pages/
│   │   ├── Dashboard.tsx    # Halaman dashboard
│   │   ├── EventData.tsx    # Daftar tamu per event
│   │   ├── ScanQR.tsx       # Scanner kehadiran
│   │   ├── ScanMerchandise.tsx
│   │   ├── ConfirmAttendance.tsx
│   │   └── ConfirmMerchandise.tsx
│   ├── routes/
│   │   └── routes.tsx       # Definisi routes
│   ├── types/
│   │   └── types.ts         # TypeScript interfaces
│   ├── App.tsx              # Root component
│   ├── index.tsx            # Entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── tailwind.config.js       # TailwindCSS config
├── tsconfig.json            # TypeScript config
└── README.md
```

## 🎨 Customization

### Mengubah Tema Warna

Edit di `src/index.css` atau buat theme MUI di `src/App.tsx`:

```typescript
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

### Mengubah Logo

Ganti file di `src/assets/` dan update referensi di komponen yang relevan.

## 🧪 Testing

```bash
# Jalankan tests
npm test

# Dengan coverage
npm test -- --coverage
```

## 🐛 Troubleshooting

### CORS Error

Pastikan backend sudah mengaktifkan CORS untuk domain frontend:

```javascript
// Di backend
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com']
}));
```

### Build Error "JavaScript heap out of memory"

```bash
# Increase Node memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Scanner Tidak Berfungsi

- Pastikan menggunakan HTTPS (camera access memerlukan secure context)
- Izinkan akses kamera di browser

## 📝 License

MIT License

## 🤝 Contributing

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request
