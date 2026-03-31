import { ref, computed } from 'vue'

export interface User {
    nik: string
    nama: string
}

const STORAGE_KEY = 'presensi_user'

export function useAuth() {
    const user = ref<User | null>(null)

    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        try {
            user.value = JSON.parse(stored) as User
        } catch {
            user.value = null
        }
    }

    const isLoggedIn = computed(() => !!user.value?.nik && !!user.value?.nama)

    function saveUser(nik: string, nama: string) {
        const data: User = { nik: nik.trim(), nama: nama.trim() }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        user.value = data
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY)
        user.value = null
    }

    return { user, isLoggedIn, saveUser, logout }
}
