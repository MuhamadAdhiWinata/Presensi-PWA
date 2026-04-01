<template>
  <div class="min-h-screen bg-slate-900 text-white pb-8 overflow-x-hidden">
    <!-- Header with Glassmorphism -->
    <header class="sticky top-0 z-20 backdrop-blur-md bg-slate-900/70 border-b border-white/10 px-4 pt-10 pb-6 shadow-2xl">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <div>
          <p class="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Authenticated User</p>
          <h1 class="text-xl font-extrabold truncate max-w-[200px] tracking-tight">{{ user?.nama }}</h1>
          <p class="text-slate-400 text-xs mt-0.5 font-medium">{{ user?.role }} • {{ user?.nik }}</p>
        </div>
        <div class="flex items-center gap-3">
          <router-link 
            v-if="user?.role === 'admin'"
            to="/admin" 
            class="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            title="Admin Panel"
          >
            <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </router-link>
          <button
            class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
            @click="logout"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-md mx-auto px-4 mt-6 space-y-6">
      
      <!-- Date Info -->
      <div class="bg-indigo-600/20 border border-indigo-500/20 rounded-3xl p-5 flex items-center justify-between">
        <div>
          <h3 class="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Schedule</h3>
          <p class="text-lg font-bold">{{ currentDate }}</p>
        </div>
        <div class="text-right">
          <span class="block text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Shift Start</span>
          <p class="text-lg font-bold">{{ user?.jam_masuk_target }}</p>
        </div>
      </div>

      <!-- Geolocation Card -->
      <section class="bg-white/5 border border-white/10 rounded-3xl p-5 relative overflow-hidden backdrop-blur-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <h2 class="font-bold text-sm tracking-tight">Real-time Location</h2>
          </div>
          <button
            class="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition disabled:opacity-30"
            :disabled="geoLoading"
            @click="refreshLocation"
          >
            Refresh
          </button>
        </div>

        <div v-if="geoLoading" class="py-4 space-y-3">
          <div class="h-6 bg-white/5 rounded-xl animate-pulse" />
          <div class="h-4 bg-white/5 rounded-xl animate-pulse w-2/3" />
        </div>

        <div v-else-if="geoError" class="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          <p class="text-red-400 text-xs font-medium leading-relaxed">{{ geoError }}</p>
        </div>

        <div v-else-if="coords" class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-slate-400 text-xs font-medium uppercase tracking-tight">Distance to Target</p>
              <p class="text-3xl font-black italic tracking-tighter" :class="isWithinRadius ? 'text-green-400' : 'text-red-400'">
                {{ distanceText }}
              </p>
            </div>
            <div
              class="flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"
              :class="isWithinRadius ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'"
            >
              <span class="w-2 h-2 rounded-full" :class="isWithinRadius ? 'bg-green-500 animate-pulse' : 'bg-red-500'" />
              {{ isWithinRadius ? 'Safe Zone' : 'Restricted' }}
            </div>
          </div>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Accuracy: ±{{ Math.round(coords.accuracy) }}m • Max: {{ maxRadius }}m
          </p>
        </div>
      </section>

      <!-- Camera Section -->
      <section class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <h2 class="font-bold text-sm text-slate-300 tracking-tight">Camera Verification</h2>
          <span v-if="fotoBase64" class="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg> Image Captured
          </span>
        </div>
        
        <div class="relative group aspect-square max-w-[320px] mx-auto rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black">
          <!-- Video Stream -->
          <video 
            v-if="!fotoPreview"
            ref="videoRef" 
            autoplay 
            playsinline 
            class="w-full h-full object-cover scale-x-[-1]"
          />
          
          <!-- Image Captured -->
          <img 
            v-else 
            :src="fotoPreview" 
            class="w-full h-full object-cover" 
          />

          <!-- Overlay when active -->
          <div v-if="!fotoPreview" class="absolute inset-0 border-[30px] border-black/40 pointer-events-none">
            <div class="w-full h-full border border-white/20 rounded-2xl" />
          </div>

          <!-- Capture/Reset Overlay -->
          <div class="absolute inset-x-0 bottom-6 flex justify-center px-6">
            <button 
              v-if="!fotoPreview"
              class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-4 border-white flex items-center justify-center active:scale-90 transition shadow-xl"
              @click="capturePhoto"
            >
              <div class="w-12 h-12 rounded-full bg-white/90" />
            </button>
            <button 
              v-else
              class="bg-red-500/90 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-xl active:scale-95 transition"
              @click="resetCamera"
            >
              Retake Photo
            </button>
          </div>
        </div>
        <canvas ref="canvasRef" class="hidden" />
      </section>

      <!-- Status Toast -->
      <Transition name="page">
        <div
          v-if="submitStatus !== 'idle'"
          class="flex items-center gap-3 rounded-2xl p-4 border"
          :class="{
            'bg-green-500/10 border-green-500/20': submitStatus === 'success',
            'bg-red-500/10 border-red-500/20': submitStatus === 'error',
            'bg-blue-500/10 border-blue-500/20': submitStatus === 'loading',
          }"
        >
          <div class="flex-shrink-0 animate-spin-slow">
            <svg v-if="submitStatus === 'success'" class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="submitStatus === 'error'" class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div v-else class="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p class="text-sm font-bold tracking-tight" :class="{
            'text-green-400': submitStatus === 'success',
            'text-red-400': submitStatus === 'error',
            'text-blue-400': submitStatus === 'loading',
          }">{{ submitMessage }}</p>
        </div>
      </Transition>

      <!-- Smart Submit Flow -->
      <div class="space-y-4">
        <div v-if="dailyStatus === 'Pulang'" class="text-center py-6 bg-slate-800/50 rounded-3xl border border-white/5 shadow-inner">
           <div class="inline-flex w-12 h-12 bg-green-500/20 text-green-400 items-center justify-center rounded-2xl mb-3">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <p class="text-sm font-bold text-slate-300">Shift Completed Today</p>
           <p class="text-xs text-slate-500 mt-1">Thank you for your hard work!</p>
        </div>
        
        <button
          v-else
          type="button"
          :disabled="!canSubmit"
          class="w-full flex items-center justify-center gap-4 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.1em] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:grayscale"
          :class="canSubmit
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 ring-2 ring-white/20'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'"
          @click="handleSubmit"
        >
          <svg v-if="!isSubmitting" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          
          <span v-if="isSubmitting">Transmitting...</span>
          <span v-else>{{ dailyStatus === 'Belum' ? 'Clock In Now' : 'Clock Out Now' }}</span>
        </button>

        <!-- Condition Info -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 px-1">
            <div :class="`w-4 h-4 rounded-full flex items-center justify-center ${fotoBase64 ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-500'}`">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span :class="`text-[11px] font-bold uppercase tracking-tight ${fotoBase64 ? 'text-slate-300' : 'text-slate-600'}`">Selfie verification captured</span>
          </div>
          <div class="flex items-center gap-2 px-1">
            <div :class="`w-4 h-4 rounded-full flex items-center justify-center ${isWithinRadius ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-500'}`">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span :class="`text-[11px] font-bold uppercase tracking-tight ${isWithinRadius ? 'text-slate-300' : 'text-slate-600'}`">Within {{ maxRadius }}m safe zone ({{ distanceText }})</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useGeolocation } from '../composables/useGeolocation'
import { usePresensi } from '../composables/usePresensi'
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()

// Geolocation
const { coords, distance, distanceText, isLoading: geoLoading, error: geoError, fetchLocation } = useGeolocation()

// Re-enforce strictly as per user request, defaulting to 50 if undefined
const maxRadius = Number(import.meta.env.VITE_MAX_RADIUS_METERS || 50)

const isWithinRadius = computed(() => {
  if (distance.value === null) return false
  return distance.value <= maxRadius
})

// Presensi
const { isSubmitting, submitStatus, submitMessage, dailyStatus, checkTodayStatus, submit, resetStatus } = usePresensi()

// Camera State
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const fotoPreview = ref<string | null>(null)
const fotoBase64 = ref('')
const stream = ref<MediaStream | null>(null)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

const canSubmit = computed(() => {
  return fotoBase64.value && isWithinRadius.value && !isSubmitting.value && dailyStatus.value !== 'Pulang'
})

async function startCamera() {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  } catch (err) {
    console.error('Camera error:', err)
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
}

function capturePhoto() {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')

  // Requirement: Resize to 600px width
  const width = 600
  const height = (video.videoHeight / video.videoWidth) * width
  
  canvas.width = width
  canvas.height = height

  if (context) {
    // Flip context horizontally for selfie
    context.translate(width, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0, width, height)
    
    // Requirement: JPEG 0.5 Quality
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5)
    fotoPreview.value = dataUrl
    fotoBase64.value = dataUrl
    stopCamera()
  }
}

function resetCamera() {
  fotoPreview.value = null
  fotoBase64.value = ''
  startCamera()
}

function refreshLocation() {
  if (user.value) {
    fetchLocation(user.value.lat_target, user.value.lng_target)
  }
}

async function handleSubmit() {
  if (!canSubmit.value || distance.value === null || !user.value) return
  resetStatus()

  const tipe = dailyStatus.value === 'Belum' ? 'Masuk' : 'Pulang'

  await submit({
    nik: user.value.nik,
    tipe: tipe,
    fotoBase64: fotoBase64.value,
    jarak_meter: Math.round(distance.value),
    lat_absen: coords.value?.latitude || 0,
    lng_absen: coords.value?.longitude || 0
  })
}

onMounted(() => {
  refreshLocation()
  startCamera()
  if (user.value) {
    checkTodayStatus(user.value.nik)
  }
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.page-enter-active, .page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}
</style>
