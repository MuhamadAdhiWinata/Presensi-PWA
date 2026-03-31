<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-8">
    <div class="w-full max-w-sm">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-800 shadow-lg mb-4"
        >
          <img src="/icon-192.png" alt="Presensi" class="w-14 h-14 rounded-2xl" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Selamat Datang</h1>
        <p class="text-gray-500 text-sm mt-1">Masukkan identitas Anda untuk mulai</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-xl p-6 space-y-5">
        <div>
          <label for="nik" class="block text-sm font-semibold text-gray-700 mb-1.5">
            NIK Karyawan
          </label>
          <input
            id="nik"
            v-model="nik"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="Masukkan NIK Anda"
            maxlength="20"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
            @keyup.enter="handleSubmit"
          />
        </div>

        <div>
          <label for="nama" class="block text-sm font-semibold text-gray-700 mb-1.5">
            Nama Lengkap
          </label>
          <input
            id="nama"
            v-model="nama"
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            maxlength="60"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
            @keyup.enter="handleSubmit"
          />
        </div>

        <!-- Error message -->
        <p v-if="errorMsg" class="text-red-500 text-sm text-center">{{ errorMsg }}</p>

        <button
          type="button"
          :disabled="isLoading"
          class="w-full py-3.5 rounded-xl bg-blue-800 text-white font-semibold text-base shadow-md active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="handleSubmit"
        >
          <span v-if="isLoading">Menyimpan...</span>
          <span v-else>Mulai Absensi →</span>
        </button>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">
        Data disimpan hanya di perangkat ini
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { saveUser } = useAuth()

const nik = ref('')
const nama = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

function handleSubmit() {
  errorMsg.value = ''

  if (!nik.value.trim()) {
    errorMsg.value = 'NIK tidak boleh kosong.'
    return
  }
  if (!nama.value.trim()) {
    errorMsg.value = 'Nama tidak boleh kosong.'
    return
  }
  if (!/^\d+$/.test(nik.value.trim())) {
    errorMsg.value = 'NIK hanya boleh berisi angka.'
    return
  }

  isLoading.value = true
  setTimeout(() => {
    saveUser(nik.value, nama.value)
    isLoading.value = false
  }, 400)
}
</script>
