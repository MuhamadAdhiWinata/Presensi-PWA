import { ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const SCANNER_ELEMENT_ID = 'qr-scanner-element'

export function useQrScanner() {
    const scannedData = ref<string | null>(null)
    const isScanning = ref(false)
    const error = ref<string | null>(null)

    let scanner: Html5Qrcode | null = null

    async function startScan(): Promise<void> {
        try {
            error.value = null
            scannedData.value = null

            // Wait one tick so the DOM element is mounted
            await new Promise((r) => setTimeout(r, 100))

            scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
            isScanning.value = true

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    scannedData.value = decodedText
                    stopScan()
                },
                () => {
                    // scan in progress — ignore per-frame errors
                },
            )
        } catch (err: unknown) {
            isScanning.value = false
            if (err instanceof Error) {
                error.value = err.message.includes('Permission')
                    ? 'Izin kamera ditolak. Aktifkan kamera di browser.'
                    : `Gagal membuka kamera: ${err.message}`
            } else {
                error.value = 'Gagal membuka kamera.'
            }
        }
    }

    async function stopScan(): Promise<void> {
        if (scanner) {
            try {
                if (scanner.isScanning) {
                    await scanner.stop()
                }
                scanner.clear()
            } catch {
                // ignore cleanup errors
            }
            scanner = null
        }
        isScanning.value = false
    }

    function resetScan() {
        scannedData.value = null
        error.value = null
    }

    return {
        SCANNER_ELEMENT_ID,
        scannedData,
        isScanning,
        error,
        startScan,
        stopScan,
        resetScan,
    }
}
