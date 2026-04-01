import { ref } from 'vue'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export interface PresensiPayload {
    nik: string
    tipe: 'Masuk' | 'Pulang'
    fotoBase64: string
    jarak_meter: number
    lat_absen: number
    lng_absen: number
}

export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'
export type DailyStatus = 'Belum' | 'Masuk' | 'Pulang'

export function usePresensi() {
    const isSubmitting = ref(false)
    const submitStatus = ref<SubmitStatus>('idle')
    const submitMessage = ref('')
    const dailyStatus = ref<DailyStatus>('Belum')

    async function checkTodayStatus(nik: string) {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'checkStatus', nik })
            })
            const result = await response.json()
            if (result.success) {
                dailyStatus.value = result.status
            }
        } catch (err) {
            console.error('Gagal cek status harian:', err)
        }
    }

    async function submit(payload: PresensiPayload): Promise<boolean> {
        isSubmitting.value = true
        submitStatus.value = 'loading'
        submitMessage.value = ''

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'submit',
                    ...payload
                }),
            })

            const result = await response.json()

            if (result.success) {
                submitStatus.value = 'success'
                submitMessage.value = result.message || 'Presensi berhasil dikirim! ✅'
                // Update status locally after success
                dailyStatus.value = payload.tipe
                return true
            } else {
                submitStatus.value = 'error'
                submitMessage.value = result.message || 'Gagal mengirim presensi.'
                return false
            }
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

    return { isSubmitting, submitStatus, submitMessage, dailyStatus, checkTodayStatus, submit, resetStatus }
}
