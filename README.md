# 📋 Presensi Digital PWA

Aplikasi absensi karyawan berbasis PWA (Progressive Web App) menggunakan Vue 3 + Vite + Tailwind CSS. Mendukung validasi geolocation radius, ambil foto selfie, dan integrasi Google Sheets via Apps Script.

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

### 2. Konfigurasi Lingkungan (Environment)

Buat file `.env` di root project Anda (salin dari `.env.example` jika ada) dan masukkan konfigurasi berikut:

```env
# URL Apps Script dari deploy baru Anda
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec

# (Opsional) Batas toleransi jarak absensi maksimal (dalam meter), Default: 50
VITE_MAX_RADIUS_METERS=50
```

URL ini didapat setelah mendeploy Apps Script (lihat langkah di bawah).

### 3. Alur Penggunaan Aplikasi

```text
Buka Aplikasi
     │
     ▼
Login (input NIK + PIN) ──── divalidasi ke backend Apps Script
     │
     ▼
Dashboard Utama
     ├── Status Lokasi (GPS) ─── jarak target lokasi ditampilkan
     ├── [Kamera Selfie] ─────── ambil foto untuk verifikasi otomatis
     └── [Kirim Absen] ───────── aktif jika: Ada Foto + Radius <50m
```

### 4. Install ke Home Screen (Android / iOS)

1. Buka aplikasi di **Chrome** (Android) atau **Safari** (iOS).
2. Tap menu `⋮` → **"Add to Home Screen"** (Android)  
   atau tap tombol **Share** → **"Add to Home Screen"** (iOS).
3. Aplikasi akan berjalan dalam mode *standalone* seperti native app.

---

## 📊 Format Google Sheets (Database)

Aplikasi ini membutuhkan **2 Sheet** pada satu file Google Spreadsheet yang sama.

### 1. Sheet `Karyawan`
Sheet ini berisi data master karyawan dan koordinat target absen mereka. Pastikan nama sheet tepat **`Karyawan`**.

| Kolom | Header | Keterangan |
|-------|--------|------------|
| A | **NIK** | Nomor Induk Karyawan |
| B | **PIN** | PIN / Password untuk login |
| C | **Nama** | Nama lengkap karyawan |
| D | **Role** | `admin` atau `user` |
| E | **Jam Masuk Target** | Contoh: `08:00` |
| F | **Lat Target** | Latitude lokasi (contoh: `-6.200000`) |
| G | **Lng Target** | Longitude lokasi (contoh: `106.816666`) |

> **Catatan:** Baris pertama (Baris 1) wajib diletak Header seperti di atas. Data dimulai dari baris 2.

#### Contoh Data (Bisa di-copy paste ke Spreadsheet)
| NIK | PIN | Nama | Role | Jam Masuk Target | Lat Target | Lng Target |
|---|---|---|---|---|---|---|
| 12345 | 123456 | Pegawai Demo | user | 08:00 | -6.200000 | 106.816666 |
| 99999 | 123456 | Admin Demo | admin | 08:00 | -6.200000 | 106.816666 |

### 2. Sheet `Presensi`
Sheet ini digunakan untuk mencatat baris absensi. Pastikan nama sheet adalah **`Presensi`**.

| Kolom | Header | Keterangan |
|-------|--------|------------|
| A | **Waktu** | Timestamp pengiriman |
| B | **NIK** | Nomor Induk Karyawan |
| C | **Tipe** | `Masuk` atau `Pulang` |
| D | **Status Waktu** | `Tepat Waktu` atau `Terlambat` |
| E | **Jarak Meter** | Jarak dari target saat absen |
| F | **Lat Absen** | Latitude saat absensi dilakukan |
| G | **Lng Absen** | Longitude saat absensi dilakukan |
| H | **Foto URL** | Link gambar ke Google Drive |

---

## ⚙️ Setup Google Apps Script & Google Drive

Aplikasi ini juga menggunakan folder Google Drive untuk menyimpan foto selfie.

### 1. Siapkan Folder Google Drive
1. Buat folder baru di Google Drive untuk menyimpan foto presensi.
2. Buka folder tersebut, salin **ID Folder** dari URL browser.
   *(Contoh URL: `drive.google.com/drive/folders/1aBcDeFgHiJ...` -> ID-nya adalah `1aBcDeFgHiJ...`)*

### 2. Setup Apps Script
1. Buka file Google Sheets yang sudah dibuat di atas.
2. Klik menu **Extensions → Apps Script**.
3. Hapus kode yang ada, paste kode di bawah ini.
4. **PENTING**: Ganti `[MASUKKAN_ID_FOLDER_DRIVE_DISINI]` di baris ke-6 kode tersebut dengan ID Folder Drive Anda.
5. Simpan file (Ctrl+S), beri nama project misal `Presensi API`.
6. Klik **Deploy → New deployment**.
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Klik **Deploy**, izinkan akses akun Anda (bila ada peringatan keamanan pilih *Advanced* -> *Go to Presensi API*).
8. Salin **Web app URL** yang diberikan, dan tempel/paste ke file `.env` di komputer Anda (variabel `VITE_APPS_SCRIPT_URL`).

### Kode Apps Script

```javascript
/**
 * CONFIGURATION
 * Silakan ganti ID sesuai dengan environment Anda.
 */
const CONFIG = {
  FOLDER_ID: '[MASUKKAN_ID_FOLDER_DRIVE_DISINI]', // ID Folder Google Drive untuk simpan foto
  SHEET_NAME_KARYAWAN: 'Karyawan',
  SHEET_NAME_PRESENSI: 'Presensi'
};

/**
 * Fungsi Login
 * Dioptimalkan dengan Array.find
 */
function login(nik, pin) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME_KARYAWAN);
  const data = sheet.getDataRange().getValues();
  
  // Header: nik, pin, nama, role, jam_masuk_target, lat_target, lng_target
  const userRow = data.find((row, idx) => idx > 0 && row[0].toString() === nik.toString() && row[1].toString() === pin.toString());
  
  if (userRow) {
    return {
      success: true,
      user: {
        nik: userRow[0],
        nama: userRow[2],
        role: userRow[3],
        jam_masuk_target: userRow[4],
        lat_target: userRow[5],
        lng_target: userRow[6]
      }
    };
  }
  
  return { success: false, message: 'NIK atau PIN salah.' };
}

/**
 * Fungsi Penanganan Foto
 * Mengonversi base64 ke Blob dan simpan ke Drive
 */
function decodeBase64Image(base64Str, filename) {
  try {
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    const contentType = base64Str.substring(base64Str.indexOf(":") + 1, base64Str.indexOf(";"));
    const bytes = Utilities.base64Decode(base64Str.split(",")[1]);
    const blob = Utilities.newBlob(bytes, contentType, filename);
    const file = folder.createFile(blob);
    
    // Cegah error jika organisasi Google Workspace menutup Izin "Anyone with link"
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      Logger.log("Peringatan: Gagal set sharing public, link tetap ada. " + shareErr);
    }
    
    return file.getUrl();
  } catch (e) {
    Logger.log("Error saving photo: " + e.toString());
    return "Error: " + e.toString();
  }
}

/**
 * Fungsi Utama Presensi (Masuk/Pulang)
 */
function submitPresensi(payload) {
  const lock = LockService.getScriptLock();
  try {
    // Tunggu hingga 30 detik untuk mendapatkan lock
    lock.waitLock(30000);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetPresensi = ss.getSheetByName(CONFIG.SHEET_NAME_PRESENSI);
    const sheetKaryawan = ss.getSheetByName(CONFIG.SHEET_NAME_KARYAWAN);
    
    // 1. Cari data karyawan dengan Array.find
    const karyawanData = sheetKaryawan.getDataRange().getValues();
    const userDataRow = karyawanData.find((row, idx) => idx > 0 && row[0].toString() === payload.nik.toString());
    
    if (!userDataRow) throw new Error("NIK tidak terdaftar.");
    const userTarget = { jam_masuk_target: userDataRow[4] };

    // 2. Tentukan Status Waktu (Terlambat/Tepat Waktu)
    const now = new Date();
    let statusWaktu = "-";
    
    if (payload.tipe === "Masuk") {
      let tHours = 8, tMinutes = 0;
      
      // Jika Google Sheets mengembalikan objek Date
      if (typeof userTarget.jam_masuk_target === "object" && userTarget.jam_masuk_target instanceof Date) {
        tHours = userTarget.jam_masuk_target.getHours();
        tMinutes = userTarget.jam_masuk_target.getMinutes();
      } else {
        // Jika format string "HH:mm" atau lainnya
        const timeStr = String(userTarget.jam_masuk_target);
        if (timeStr.includes(":")) {
          const parts = timeStr.split(":");
          tHours = Number(parts[0]);
          tMinutes = Number(parts[1]);
        }
      }
      
      const targetDate = new Date();
      targetDate.setHours(tHours, tMinutes, 0, 0);
      
      statusWaktu = now > targetDate ? "Terlambat" : "Tepat Waktu";
    }

    // 3. Simpan Foto ke Drive
    const dateStr = Utilities.formatDate(now, "GMT+7", "yyyyMMdd_HHmmss");
    const fileName = `${payload.nik}_${payload.tipe}_${dateStr}.jpg`;
    const fotoUrl = decodeBase64Image(payload.fotoBase64, fileName);

    // 4. Append Data ke Sheet 'Presensi'
    sheetPresensi.appendRow([
      now,
      payload.nik,
      payload.tipe,
      statusWaktu,
      payload.jarak_meter,
      payload.lat_absen,
      payload.lng_absen,
      fotoUrl
    ]);

    return { success: true, message: "Presensi berhasil dicatat." };
    
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Fungsi Admin: Rekap Harian
 * Dioptimalkan: Berhenti iterasi saat tanggal melewati hari ini dari bawah (O(K)) dan menggunakan Set (O(1))
 */
function getRekapHarian() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetKaryawan = ss.getSheetByName(CONFIG.SHEET_NAME_KARYAWAN);
  const sheetPresensi = ss.getSheetByName(CONFIG.SHEET_NAME_PRESENSI);
  
  const karyawan = sheetKaryawan.getDataRange().getValues();
  const presensi = sheetPresensi.getDataRange().getValues();
  
  const today = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  
  // Dapatkan awal hari ini untuk fast fail
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  
  const absenHariIni = new Set();
  
  // Looping dari list terbawah (terbaru)
  for (let j = presensi.length - 1; j >= 1; j--) {
    const pTimestamp = presensi[j][0];
    if (!pTimestamp) continue;
    
    const recordDate = new Date(pTimestamp);
    if (recordDate < todayObj) {
      // Karena data berurutan, jika tanggal sudah lewat batas kemarin, bisa stop looping (O(1) behavior daily)
      break; 
    }
    
    const pDate = Utilities.formatDate(recordDate, "GMT+7", "yyyy-MM-dd");
    if (pDate === today) {
      const pNik = presensi[j][1];
      absenHariIni.add(pNik.toString());
    }
  }
  
  const rekap = [];
  for (let i = 1; i < karyawan.length; i++) {
    const nik = karyawan[i][0].toString();
    const nama = karyawan[i][2];
    
    const sudahAbsen = absenHariIni.has(nik) ? "Sudah" : "Belum";
    rekap.push({ nik, nama, status: sudahAbsen });
  }
  
  return rekap;
}

/**
 * Fungsi: Cek Status Presensi User Hari Ini
 * Dioptimalkan: Iterasi dari bawah untuk langsung menemukan status terbaru
 */
function checkStatus(nik) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetPresensi = ss.getSheetByName(CONFIG.SHEET_NAME_PRESENSI);
  const presensi = sheetPresensi.getDataRange().getValues();
  
  const today = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  let status = "Belum"; // Belum, Masuk, Pulang
  
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  
  for (let j = presensi.length - 1; j >= 1; j--) {
    const pTimestamp = presensi[j][0];
    if (!pTimestamp) continue;
    
    const recordDate = new Date(pTimestamp);
    if (recordDate < todayObj) {
      break; // Sudah melebihi hari ini, jadi pasti 'Belum'
    }
    
    const pNik = presensi[j][1];
    if (pNik.toString() === nik.toString()) {
      const pDate = Utilities.formatDate(recordDate, "GMT+7", "yyyy-MM-dd");
      if (pDate === today) {
        status = presensi[j][2]; // 'Masuk' atau 'Pulang'
        break; // Dapatkan yang paling terbaru langsung break
      }
    }
  }
  
  return { success: true, status: status };
}

/**
 * doPost Handler
 * Endpoint utama untuk Integrasi Frontend
 */
function doPost(e) {
  let requestData;
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const action = requestData.action;
  let result;
  
  if (action === "login") {
    result = login(requestData.nik, requestData.pin);
  } else if (action === "submit") {
    result = submitPresensi(requestData);
  } else if (action === "getRekap") {
    result = getRekapHarian();
  } else if (action === "checkStatus") {
    result = checkStatus(requestData.nik);
  } else {
    result = { success: false, message: "Action not found" };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🏗️ Struktur Project

```text
src/
├── composables/
│   ├── useAuth.ts          # localStorage login
│   ├── useGeolocation.ts   # GPS + Haversine distance
│   └── usePresensi.ts      # fetch POST ke Apps Script
└── components/
    ├── SplashScreen.vue    # Splash screen animasi
    ├── LoginForm.vue       # Input NIK + PIN
    ├── HomeView.vue        # Dashboard utama (Lokasi & Selfie)
    ├── MonitoringView.vue  # Dashboard Admin Rekap Presensi
    └── StatCard.vue        # Komponen Statistik Dashboard Admin
```

## 📦 Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Vue 3 + TypeScript (`<script setup>`) |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| PWA | vite-plugin-pwa + Workbox |
| Backend | Google Apps Script + Google Sheets + Google Drive |
