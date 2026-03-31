import { ref } from 'vue'

// ===================================================
// TODO: Ganti dengan URL Google Apps Script Anda
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhR20YcrZgjc5jhEVq0VWzrTLYuVnC_LKxr6LA9-65v1eQM7OX1XjKunxFy7JbBQ9l/exec'
// ===================================================

export interface PresensiPayload {
    nik: string
    nama: string
    qrData: string
    latitude: number
    longitude: number
    timestamp: string
}

export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export function usePresensi() {
    const isSubmitting = ref(false)
    const submitStatus = ref<SubmitStatus>('idle')
    const submitMessage = ref('')

    async function submit(payload: PresensiPayload): Promise<boolean> {
        isSubmitting.value = true
        submitStatus.value = 'loading'
        submitMessage.value = ''

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script requires no-cors
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            // With no-cors, response.type === 'opaque', we can't read the body.
            // Assume success if no network error was thrown.
            void response
            submitStatus.value = 'success'
            submitMessage.value = 'Presensi berhasil dikirim! ✅'
            return true
        } catch (err: unknown) {
            submitStatus.value = 'error'
            submitMessage.value =
                err instanceof Error ? `Gagal mengirim: ${err.message}` : 'Gagal mengirim presensi.'
            return false
        } finally {
            isSubmitting.value = false
        }
    }

    function resetStatus() {
        submitStatus.value = 'idle'
        submitMessage.value = ''
    }

    return { isSubmitting, submitStatus, submitMessage, submit, resetStatus }
}
