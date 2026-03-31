# 📋 Presensi Digital PWA

Aplikasi absensi karyawan berbasis PWA (Progressive Web App) menggunakan Vue 3 + Vite + Tailwind CSS. Mendukung scan QR Code, validasi geolocation radius, dan integrasi Google Sheets via Apps Script.

---

## 🚀 Cara Penggunaan

### 1. Setup Project

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Build production
npm run build
```

### 2. Konfigurasi Koordinat Kantor

Buka `src/composables/useGeolocation.ts` dan ganti baris berikut:

```ts
const OFFICE_LAT = -6.200000   // ← Latitude kantor Anda
const OFFICE_LNG = 106.816666  // ← Longitude kantor Anda
```

> **Tip:** Cara mudah mendapatkan koordinat — buka Google Maps, klik kanan pada lokasi kantor, lalu salin angka yang muncul (format: lat, lng).

### 3. Konfigurasi URL Google Apps Script

Buka `src/composables/usePresensi.ts` dan ganti baris berikut:

```ts
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
```

URL ini didapat setelah deploy Apps Script (lihat langkah di bawah).

### 4. Alur Penggunaan Aplikasi

```
Buka Aplikasi
     │
     ▼
Splash Screen (2 detik)
     │
     ▼
Login (input NIK + Nama) ──── tersimpan di localStorage
     │
     ▼
Dashboard Utama
     ├── Status Lokasi (GPS) ─── jarak dari kantor ditampilkan
     ├── [Scan Presensi] ──────── buka kamera untuk scan QR
     └── [Kirim Absen] ────────── aktif jika: QR terscan + dalam radius 50m
```

### 5. Install ke Home Screen (Android / iOS)

1. Buka aplikasi di **Chrome** (Android) atau **Safari** (iOS)
2. Tap menu `⋮` → **"Add to Home Screen"** (Android)  
   atau tap tombol **Share** → **"Add to Home Screen"** (iOS)
3. Aplikasi akan berjalan dalam mode *standalone* seperti native app

---

## 📊 Format Google Sheets

Buat sheet baru dengan nama **`Presensi`** dan kolom berikut (header di baris 1):

| Kolom | Header | Keterangan |
|-------|--------|------------|
| A | **Timestamp** | Waktu pengiriman absen (ISO 8601) |
| B | **NIK** | Nomor Induk Karyawan |
| C | **Nama** | Nama lengkap karyawan |
| D | **QR Data** | Data yang terbaca dari QR Code |
| E | **Latitude** | Koordinat GPS karyawan saat absen |
| F | **Longitude** | Koordinat GPS karyawan saat absen |
| G | **Tanggal** | Tanggal absen (format lokal ID) |
| H | **Jam** | Jam absen (format 24 jam) |

> **Catatan:** Kolom G dan H di-generate otomatis oleh Apps Script dari nilai Timestamp.

---

## ⚙️ Google Apps Script

### Langkah Setup

1. Buka Google Sheets yang akan digunakan
2. Klik menu **Extensions → Apps Script**
3. Hapus kode yang ada, paste kode di bawah ini
4. Simpan (Ctrl+S), beri nama project misal `PresensiAPI`
5. Klik **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Klik **Deploy**, izinkan akses, lalu **salin URL** yang diberikan
7. Paste URL tersebut ke `APPS_SCRIPT_URL` di aplikasi

### Kode Apps Script

```javascript
const SHEET_NAME = 'Presensi'; // Ganti jika nama sheet berbeda

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Buat sheet baru jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Buat header
      sheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp', 'NIK', 'Nama', 'QR Data',
        'Latitude', 'Longitude', 'Tanggal', 'Jam'
      ]]);
      sheet.getRange(1, 1, 1, 8)
        .setFontWeight('bold')
        .setBackground('#1e40af')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // Parse body JSON
    const data = JSON.parse(e.postData.contents);

    const ts = new Date(data.timestamp);
    const options = { timeZone: 'Asia/Jakarta' };

    const tanggal = ts.toLocaleDateString('id-ID', {
      ...options, day: '2-digit', month: 'long', year: 'numeric'
    });
    const jam = ts.toLocaleTimeString('id-ID', {
      ...options, hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // Tambahkan baris baru
    sheet.appendRow([
      data.timestamp,
      data.nik,
      data.nama,
      data.qrData,
      data.latitude,
      data.longitude,
      tanggal,
      jam
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Presensi berhasil dicatat.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Untuk testing via browser (GET)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Presensi API aktif.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Contoh Data yang Dikirim Aplikasi (JSON)

```json
{
  "nik": "12345",
  "nama": "Budi Santoso",
  "qrData": "ABSENSI-PAGI-2026-03-31",
  "latitude": -6.200123,
  "longitude": 106.816789,
  "timestamp": "2026-03-31T04:30:00.000Z"
}
```

### Test API (Opsional)

Buka URL Apps Script di browser — jika muncul `{"status":"ok","message":"Presensi API aktif."}` berarti sudah aktif.

---

## 🏗️ Struktur Project

```
src/
├── composables/
│   ├── useAuth.ts          # localStorage login
│   ├── useGeolocation.ts   # GPS + Haversine distance
│   ├── useQrScanner.ts     # html5-qrcode wrapper
│   └── usePresensi.ts      # fetch POST ke Apps Script
└── components/
    ├── SplashScreen.vue    # Splash screen animasi
    ├── LoginForm.vue       # Input NIK + Nama
    ├── QrScannerModal.vue  # Kamera scanner
    └── HomeView.vue        # Dashboard utama
```

## 📦 Tech Stack

| | |
|---|---|
| Framework | Vue 3 + TypeScript (`<script setup>`) |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| PWA | vite-plugin-pwa + Workbox |
| QR Scanner | html5-qrcode |
| Backend | Google Apps Script + Google Sheets |
