<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-blue-800"
    >
      <!-- Background blobs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute -top-24 -left-24 w-72 h-72 bg-blue-700 rounded-full opacity-50 blur-3xl"
        />
        <div
          class="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-900 rounded-full opacity-60 blur-3xl"
        />
      </div>

      <!-- Logo + Pulse ring -->
      <div class="relative flex items-center justify-center mb-8">
        <span class="absolute inline-flex h-32 w-32 rounded-full bg-white opacity-10 animate-ping" />
        <div
          class="relative z-10 w-28 h-28 rounded-full bg-white/10 backdrop-blur flex items-center justify-center shadow-2xl border border-white/20"
        >
          <img src="/icon-192.png" alt="Presensi" class="w-20 h-20 rounded-2xl" />
        </div>
      </div>

      <!-- App name -->
      <h1 class="text-4xl font-bold text-white tracking-tight">Presensi</h1>
      <p class="text-blue-200 mt-1 text-sm tracking-widest uppercase">Sistem Absensi Digital</p>

      <!-- Loading dots -->
      <div class="mt-10 flex gap-2">
        <span
          v-for="i in 3"
          :key="i"
          class="w-2 h-2 rounded-full bg-blue-300 animate-bounce"
          :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, 2200)
})
</script>
