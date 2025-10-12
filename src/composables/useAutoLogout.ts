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

  const INACTIVITY_TIME = inactivityMinutes * 60 * 1000
  const WARNING_TIME = warningSeconds * 1000

  const performLogout = async () => {
    try {
      await signOut()
      showWarning.value = false
      router.push('/signin')
      
      setTimeout(() => {
        alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.')
      }, 100)
    } catch {
      // Error silencioso
    }
  }

  const startWarning = () => {
    showWarning.value = true
    remainingSeconds.value = warningSeconds

    warningIntervalId = setInterval(() => {
      remainingSeconds.value--
      if (remainingSeconds.value <= 0) {
        if (warningIntervalId) clearInterval(warningIntervalId)
      }
    }, 1000)

    logoutTimeoutId = setTimeout(() => {
      performLogout()
    }, WARNING_TIME)
  }

  const resetTimer = () => {
    if (showWarning.value) {
      showWarning.value = false
      if (warningIntervalId) clearInterval(warningIntervalId)
      if (logoutTimeoutId) clearTimeout(logoutTimeoutId)
    }

    if (inactivityTimeoutId) {
      clearTimeout(inactivityTimeoutId)
    }

    if (isAuthenticated.value) {
      inactivityTimeoutId = setTimeout(() => {
        startWarning()
      }, INACTIVITY_TIME - WARNING_TIME)
    }
  }

  const stayLoggedIn = () => {
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

    resetTimer()
  }

  const cleanup = () => {
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