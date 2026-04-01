import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export interface User {
    nik: string
    nama: string
    role: string
    jam_masuk_target: string
    lat_target: number
    lng_target: number
}

const STORAGE_KEY = 'presensi_user'
// URL should be consistent across composables
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export function useAuth() {
    const user = ref<User | null>(null)
    const isAuthenticating = ref(false)
    const authError = ref('')
    const router = useRouter()

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

    async function login(nik: string, pin: string): Promise<boolean> {
        isAuthenticating.value = true
        authError.value = ''

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'login', nik, pin })
            })

            const result = await response.json()

            if (result.success) {
                user.value = result.user
                localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))

                // Redirect based on role
                if (result.user.role === 'admin') {
                    router?.push('/admin')
                } else {
                    router?.push('/')
                }

                return true
            } else {
                authError.value = result.message || 'Login gagal.'
                return false
            }
        } catch (err) {
            authError.value = 'Terjadi kesalahan koneksi.'
            return false
        } finally {
            isAuthenticating.value = false
        }
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY)
        user.value = null
        router?.push('/login')
    }

    return { user, isLoggedIn, isAuthenticating, authError, login, logout }
}
