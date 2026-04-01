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
