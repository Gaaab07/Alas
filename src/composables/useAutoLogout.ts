import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'

export const useAutoLogout = (
  inactivityMinutes: number = 2,
  warningSeconds: number = 30
) => {
  const router = useRouter()
  const { signOut, isAuthenticated } = useAuth()

  const showWarning = ref(false)
  const remainingSeconds = ref(warningSeconds)

  let inactivityTimeoutId: NodeJS.Timeout | null = null
  let warningIntervalId: NodeJS.Timeout | null = null
  let logoutTimeoutId: NodeJS.Timeout | null = null

  const INACTIVITY_TIME = inactivityMinutes * 60 * 1000 // 2 minutos en ms
  const WARNING_TIME = warningSeconds * 1000 // 30 segundos en ms

  const performLogout = async () => {
    try {
      console.log('🚪 Cerrando sesión por inactividad...')
      await signOut()
      showWarning.value = false
      router.push('/signin')
      
      // Alerta después de redirigir
      setTimeout(() => {
        alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.')
      }, 100)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const startWarning = () => {
    console.log('⚠️ Mostrando advertencia de sesión')
    showWarning.value = true
    remainingSeconds.value = warningSeconds

    // Countdown del timer
    warningIntervalId = setInterval(() => {
      remainingSeconds.value--
      if (remainingSeconds.value <= 0) {
        if (warningIntervalId) clearInterval(warningIntervalId)
      }
    }, 1000)

    // Auto-logout después del warning
    logoutTimeoutId = setTimeout(() => {
      performLogout()
    }, WARNING_TIME)
  }

  const resetTimer = () => {
    // Cancelar warnings activos
    if (showWarning.value) {
      console.log('✅ Usuario activo, cancelando advertencia')
      showWarning.value = false
      if (warningIntervalId) clearInterval(warningIntervalId)
      if (logoutTimeoutId) clearTimeout(logoutTimeoutId)
    }

    // Cancelar timer de inactividad anterior
    if (inactivityTimeoutId) {
      clearTimeout(inactivityTimeoutId)
    }

    // Solo reiniciar si está autenticado
    if (isAuthenticated.value) {
      // Timer: inactividad - tiempo de advertencia
      inactivityTimeoutId = setTimeout(() => {
        startWarning()
      }, INACTIVITY_TIME - WARNING_TIME)
    }
  }

  const stayLoggedIn = () => {
    console.log('👤 Usuario eligió continuar navegando')
    showWarning.value = false
    if (warningIntervalId) clearInterval(warningIntervalId)
    if (logoutTimeoutId) clearTimeout(logoutTimeoutId)
    resetTimer()
  }

  const setupListeners = () => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })

    console.log(`⏲️ Auto-logout activado: ${inactivityMinutes} min de inactividad`)
    resetTimer()
  }

  const cleanup = () => {
    console.log('🧹 Limpiando auto-logout...')
    
    if (inactivityTimeoutId) clearTimeout(inactivityTimeoutId)
    if (warningIntervalId) clearInterval(warningIntervalId)
    if (logoutTimeoutId) clearTimeout(logoutTimeoutId)

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    events.forEach(event => {
      document.removeEventListener(event, resetTimer, true)
    })
  }

  onMounted(() => {
    if (isAuthenticated.value) {
      setupListeners()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    showWarning,
    remainingSeconds,
    stayLoggedIn,
    performLogout
  }
}