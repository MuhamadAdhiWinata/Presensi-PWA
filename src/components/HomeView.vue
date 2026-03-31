<template>
  <div class="min-h-screen bg-blue-50 pb-8">
    <!-- Top Bar -->
    <header class="bg-blue-800 text-white px-4 pt-12 pb-6 shadow-lg">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <div>
          <p class="text-blue-200 text-xs uppercase tracking-widest">Halo,</p>
          <h1 class="text-xl font-bold truncate max-w-[200px]">{{ user?.nama }}</h1>
          <p class="text-blue-300 text-xs mt-0.5">NIK: {{ user?.nik }}</p>
        </div>
        <button
          class="flex items-center gap-1.5 text-blue-300 text-xs hover:text-white transition"
          @click="emit('logout')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Keluar
        </button>
      </div>
      <!-- Date -->
      <div class="max-w-md mx-auto mt-3">
        <p class="text-blue-100 text-sm">{{ currentDate }}</p>
      </div>
    </header>

    <div class="max-w-md mx-auto px-4 space-y-4 mt-5">

      <!-- Geolocation Card -->
      <div class="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Status Lokasi
          </h2>
          <button
            class="text-xs text-blue-600 font-medium hover:text-blue-800 transition disabled:opacity-40"
            :disabled="geoLoading"
            @click="fetchLocation"
          >
            {{ geoLoading ? 'Memuat...' : 'Perbarui' }}
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-if="geoLoading" class="space-y-2 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
        </div>

        <!-- Error -->
        <div v-else-if="geoError" class="flex items-start gap-2 bg-red-50 rounded-xl p-3">
          <svg class="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          <p class="text-red-600 text-xs">{{ geoError }}</p>
        </div>

        <!-- Result -->
        <div v-else-if="coords" class="space-y-3">
          <div class="flex items-center gap-3">
            <!-- Status badge -->
            <div
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              :class="isWithinRadius ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            >
              <span
                class="w-2 h-2 rounded-full"
                :class="isWithinRadius ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
              />
              {{ isWithinRadius ? 'Dalam Radius' : 'Di Luar Radius' }}
            </div>
            <span class="text-gray-500 text-sm font-medium">{{ distanceText }} dari kantor</span>
          </div>

          <!-- Coords detail -->
          <div class="text-xs text-gray-400 space-y-0.5">
            <p>Lat: {{ coords.latitude.toFixed(6) }}, Lng: {{ coords.longitude.toFixed(6) }}</p>
            <p>Akurasi: ±{{ Math.round(coords.accuracy) }} meter</p>
          </div>
        </div>

        <!-- Idle state -->
        <div v-else class="text-center py-3">
          <p class="text-gray-400 text-sm">Klik "Perbarui" untuk cek lokasi</p>
        </div>
      </div>

      <!-- Out-of-radius warning -->
      <Transition name="fade">
        <div
          v-if="coords && !isWithinRadius"
          class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4"
        >
          <div class="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-red-700 text-sm">Anda di luar radius</p>
            <p class="text-red-500 text-xs mt-0.5">
              Anda harus berada dalam {{ RADIUS_METERS }} meter dari kantor untuk absen.
            </p>
          </div>
        </div>
      </Transition>

      <!-- QR Result Card -->
      <Transition name="page">
        <div
          v-if="qrResult"
          class="bg-white rounded-2xl shadow-sm border border-blue-100 p-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <h3 class="text-sm font-semibold text-gray-800">Hasil Scan QR</h3>
            <button class="ml-auto text-gray-400 hover:text-gray-600" @click="qrResult = null">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-blue-700 text-sm font-mono bg-blue-50 rounded-lg px-3 py-2 break-all">{{ qrResult }}</p>
        </div>
      </Transition>

      <!-- Submit result toast -->
      <Transition name="page">
        <div
          v-if="submitStatus !== 'idle'"
          class="flex items-center gap-3 rounded-2xl p-4 border"
          :class="{
            'bg-green-50 border-green-200': submitStatus === 'success',
            'bg-red-50 border-red-200': submitStatus === 'error',
            'bg-blue-50 border-blue-200': submitStatus === 'loading',
          }"
        >
          <svg v-if="submitStatus === 'success'" class="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="submitStatus === 'error'" class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-5 h-5 text-blue-500 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p class="text-sm font-medium" :class="{
            'text-green-700': submitStatus === 'success',
            'text-red-700': submitStatus === 'error',
            'text-blue-700': submitStatus === 'loading',
          }">{{ submitMessage }}</p>
        </div>
      </Transition>

      <!-- Action buttons -->
      <div class="space-y-3 pt-2">
        <!-- Scan button -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-800 text-white font-semibold text-base shadow-lg active:scale-95 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="showScanner = true"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan Presensi
        </button>

        <!-- Submit button -->
        <button
          type="button"
          :disabled="!canSubmit"
          class="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base shadow-md active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          :class="canSubmit
            ? 'bg-green-600 text-white hover:bg-green-500 shadow-green-200'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'"
          @click="handleSubmit"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span v-if="isSubmitting">Mengirim...</span>
          <span v-else>Kirim Absen</span>
        </button>

        <!-- Reason why submit is disabled -->
        <p v-if="!qrResult && !isWithinRadius && coords" class="text-center text-xs text-gray-400">
          Scan QR dan pastikan Anda dalam radius kantor untuk mengirim absen
        </p>
        <p v-else-if="!qrResult" class="text-center text-xs text-gray-400">
          Scan QR Code terlebih dahulu
        </p>
        <p v-else-if="!isWithinRadius && coords" class="text-center text-xs text-gray-400">
          Pastikan Anda dalam radius {{ RADIUS_METERS }} meter dari kantor
        </p>
      </div>
    </div>

    <!-- QR Scanner Modal -->
    <QrScannerModal
      :is-open="showScanner"
      @scanned="onQrScanned"
      @close="showScanner = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import QrScannerModal from './QrScannerModal.vue'
import { useGeolocation } from '../composables/useGeolocation'
import { usePresensi } from '../composables/usePresensi'
import type { User } from '../composables/useAuth'

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()

// Geo
const { coords, distanceText, isWithinRadius, isLoading: geoLoading, error: geoError, fetchLocation, RADIUS_METERS } = useGeolocation()

// QR
const showScanner = ref(false)
const qrResult = ref<string | null>(null)

// Submit
const { isSubmitting, submitStatus, submitMessage, submit, resetStatus } = usePresensi()

// Current date display
const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Can submit only if QR scanned + within radius
const canSubmit = computed(() => {
  return !!qrResult.value && isWithinRadius.value && !isSubmitting.value && submitStatus.value !== 'success'
})

function onQrScanned(result: string) {
  qrResult.value = result
  showScanner.value = false
  // Auto-refresh location after scan
  fetchLocation()
}

async function handleSubmit() {
  if (!canSubmit.value || !coords.value) return
  resetStatus()

  await submit({
    nik: props.user.nik,
    nama: props.user.nama,
    qrData: qrResult.value!,
    latitude: coords.value.latitude,
    longitude: coords.value.longitude,
    timestamp: new Date().toISOString(),
  })
}

// Auto-fetch location on mount
onMounted(() => {
  fetchLocation()
})
</script>
