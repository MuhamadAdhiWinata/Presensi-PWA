<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8 overflow-hidden relative">
    <!-- Abstract background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]" />
        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900 rounded-full blur-[120px]" />
    </div>

    <div class="w-full max-w-sm relative z-10 transition-all duration-700" :class="{ 'opacity-0 translate-y-4': !isMounted }">
      <!-- Header -->
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl mb-6 group transition-transform hover:scale-105"
        >
          <img src="/icon-192.png" alt="Presensi" class="w-16 h-16 rounded-2xl grayscale brightness-125 transition-all group-hover:grayscale-0 group-hover:brightness-100" />
        </div>
        <h1 class="text-3xl font-black text-white tracking-tighter">System Access</h1>
        <p class="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Enter credentials to continue</p>
      </div>

      <!-- Card -->
      <div class="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 space-y-6 shadow-2xl">
        <div class="space-y-1.5">
          <label for="nik" class="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
            Employment ID (NIK)
          </label>
          <input
            id="nik"
            v-model="nik"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="00000000"
            maxlength="20"
            class="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm font-bold tracking-wider"
            @keyup.enter="handleSubmit"
          />
        </div>

        <div class="space-y-1.5">
          <label for="pin" class="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
            Security PIN
          </label>
          <input
            id="pin"
            v-model="pin"
            type="password"
            inputmode="numeric"
            placeholder="••••••"
            maxlength="6"
            class="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm font-bold tracking-widest"
            @keyup.enter="handleSubmit"
          />
        </div>

        <!-- Error feedback -->
        <Transition name="fade">
            <div v-if="authError || localError" class="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
                <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                <p class="text-red-400 text-xs font-bold leading-none">{{ authError || localError }}</p>
            </div>
        </Transition>

        <button
          type="button"
          :disabled="isAuthenticating"
          class="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
          @click="handleSubmit"
        >
          <span v-if="isAuthenticating" class="flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Authenticating...
          </span>
          <span v-else>Access Dashboard</span>
        </button>

        <div class="pt-4 mt-2 text-center border-t border-white/5">
          <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Akun Demo (Testing)</p>
          <div class="flex justify-center gap-4 text-[10px] font-mono font-bold text-slate-400">
            <span>NIK: <span class="text-white">12345</span></span>
            <span>PIN: <span class="text-white">123456</span></span>
          </div>
        </div>
      </div>

      <p class="text-center text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase mt-10">
        Attendance System v2.0 • Secured
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { login, isAuthenticating, authError } = useAuth()

const isMounted = ref(false)
const nik = ref('')
const pin = ref('')
const localError = ref('')

async function handleSubmit() {
  localError.value = ''

  if (!nik.value.trim()) {
    localError.value = 'NIK REQUIRED'
    return
  }
  if (!pin.value.trim()) {
    localError.value = 'PIN REQUIRED'
    return
  }
  if (!/^\d+$/.test(nik.value.trim())) {
    localError.value = 'INVALID NIK FORMAT'
    return
  }

  await login(nik.value.trim(), pin.value.trim())
}

onMounted(() => {
    setTimeout(() => isMounted.value = true, 100)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
