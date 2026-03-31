<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 flex flex-col bg-black"
        @touchmove.prevent
      >
        <!-- Header bar -->
        <div class="flex items-center justify-between px-4 py-3 bg-black/80 z-10 safe-top">
          <div>
            <h2 class="text-white font-semibold text-base">Scan QR Code</h2>
            <p class="text-gray-400 text-xs">Arahkan kamera ke QR Code presensi</p>
          </div>
          <button
            type="button"
            class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
            @click="handleClose"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scanner area -->
        <div class="flex-1 relative flex items-center justify-center">
          <!-- Scanner element -->
          <div :id="SCANNER_ELEMENT_ID" class="w-full h-full" />

          <!-- Corner guides overlay -->
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div class="relative w-64 h-64">
              <!-- Corner brackets -->
              <span class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <span class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <span class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <span class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              <!-- Scan line animation -->
              <span class="absolute left-1 right-1 top-1/2 h-0.5 bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.8)] animate-scan-line" />
            </div>
          </div>

          <!-- Error state -->
          <div
            v-if="scannerError"
            class="absolute inset-0 flex items-center justify-center bg-black/70 px-8"
          >
            <div class="bg-red-900/80 rounded-2xl p-6 text-center backdrop-blur">
              <svg class="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
              <p class="text-white text-sm">{{ scannerError }}</p>
              <button
                class="mt-4 px-5 py-2 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20 transition"
                @click="handleClose"
              >Tutup</button>
            </div>
          </div>

          <!-- Loading overlay -->
          <div v-if="!isScanning && !scannerError" class="absolute inset-0 flex items-center justify-center bg-black/80">
            <div class="text-center">
              <svg class="w-10 h-10 animate-spin text-blue-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p class="text-gray-400 text-sm">Membuka kamera...</p>
            </div>
          </div>
        </div>

        <!-- Bottom note -->
        <div class="px-4 py-4 bg-black/80 text-center safe-bottom">
          <p class="text-gray-500 text-xs">Posisikan QR Code di dalam bingkai</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useQrScanner } from '../composables/useQrScanner'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'scanned', result: string): void
  (e: 'close'): void
}>()

const { SCANNER_ELEMENT_ID, isScanning, error: scannerError, scannedData, startScan, stopScan, resetScan } = useQrScanner()

// Start/stop scanner when modal opens/closes
watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      resetScan()
      await startScan()
    } else {
      await stopScan()
    }
  },
)

// Emit when QR scanned
watch(scannedData, (val) => {
  if (val) {
    emit('scanned', val)
  }
})

async function handleClose() {
  await stopScan()
  emit('close')
}
</script>

<style scoped>
@keyframes scan-line {
  0%, 100% { transform: translateY(-100px); }
  50% { transform: translateY(100px); }
}
.animate-scan-line {
  animation: scan-line 2s ease-in-out infinite;
}
</style>
