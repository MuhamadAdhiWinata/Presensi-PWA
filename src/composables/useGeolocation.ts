import { ref, computed } from 'vue'

export interface Coords {
    latitude: number
    longitude: number
    accuracy: number
}

/**
 * Haversine formula — menghitung jarak (meter) antara dua titik GPS
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000 // radius bumi dalam meter
    const toRad = (deg: number) => (deg * Math.PI) / 180

    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export function useGeolocation() {
    const coords = ref<Coords | null>(null)
    const distance = ref<number | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const RADIUS_METERS = 100 // Updated default radius

    const isWithinRadius = computed(() => {
        if (distance.value === null) return false
        return distance.value <= RADIUS_METERS
    })

    const distanceText = computed(() => {
        if (distance.value === null) return '—'
        if (distance.value < 1000) return `${Math.round(distance.value)} m`
        return `${(distance.value / 1000).toFixed(1)} km`
    })

    function fetchLocation(targetLat: number, targetLng: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                error.value = 'Geolocation tidak didukung browser ini'
                reject(new Error(error.value))
                return
            }

            isLoading.value = true
            error.value = null

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    coords.value = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    }
                    distance.value = haversineDistance(
                        position.coords.latitude,
                        position.coords.longitude,
                        targetLat,
                        targetLng,
                    )
                    isLoading.value = false
                    resolve()
                },
                (err) => {
                    isLoading.value = false
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            error.value = 'Izin lokasi ditolak. Aktifkan GPS di browser.'
                            break
                        case err.POSITION_UNAVAILABLE:
                            error.value = 'Informasi lokasi tidak tersedia.'
                            break
                        case err.TIMEOUT:
                            error.value = 'Permintaan lokasi timed out.'
                            break
                        default:
                            error.value = 'Terjadi kesalahan saat mendapatkan lokasi.'
                    }
                    reject(new Error(error.value))
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                },
            )
        })
    }

    return {
        coords,
        distance,
        distanceText,
        isWithinRadius,
        isLoading,
        error,
        fetchLocation,
        RADIUS_METERS,
    }
}
