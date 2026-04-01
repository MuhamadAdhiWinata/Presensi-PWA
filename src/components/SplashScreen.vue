<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900"
    >
      <!-- Background blobs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute -top-24 -left-24 w-72 h-72 bg-blue-600 rounded-full opacity-20 blur-3xl"
        />
        <div
          class="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-900 rounded-full opacity-30 blur-3xl"
        />
      </div>

      <!-- Logo + Pulse ring -->
      <div class="relative flex items-center justify-center mb-8">
        <span class="absolute inline-flex h-32 w-32 rounded-full bg-blue-500 opacity-10 animate-ping" />
        <div
          class="relative z-10 w-28 h-28 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/10"
        >
          <img src="/icon-192.png" alt="Presensi" class="w-16 h-16 rounded-2xl grayscale brightness-125" />
        </div>
      </div>

      <!-- App name -->
      <h1 class="text-4xl font-black text-white tracking-tighter">PRESENSI</h1>
      <p class="text-blue-400 mt-2 text-[10px] font-bold tracking-[0.3em] uppercase">Digital Attendance System</p>

      <!-- Loading dots -->
      <div class="mt-12 flex gap-3">
        <span
          v-for="i in 3"
          :key="i"
          class="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-bounce"
          :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits(['finish'])
const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
    setTimeout(() => emit('finish'), 400)
  }, 2200)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
