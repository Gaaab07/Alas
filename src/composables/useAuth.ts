// composables/useAuth.ts
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import type { User } from '@supabase/supabase-js'

// Si tienes la tabla profiles definida, puedes crear un tipo para ella
type Profile = {
  id: string
  full_name: string | null
  role: 'admin' | 'customer' | null
}

// ✅ SINGLETONS - se crean solo una vez
const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)
const isInitialized = ref(false)

// Función para inicializar una sola vez
const initializeAuth = async () => {
  if (isInitialized.value) return

  // Cargar usuario inicial
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    user.value = data.user
    await getProfile()
  }

  // Configurar listener una sola vez
  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user || null
    profile.value = null // Limpiar perfil cuando cambie el usuario
    
    if (user.value) {
      await getProfile()
    }
  })

  isInitialized.value = true
}

const getProfile = async () => {
  if (!user.value) {
    profile.value = null
    return null
  }

  console.log('Cargando perfil para usuario:', user.value.id)
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .single<Profile>()

  console.log('Resultado getProfile:', { data, error })

  if (error) {
    console.error('Error cargando perfil:', error)
    profile.value = null
    return null
  }

  if (data) {
    profile.value = data
    console.log('Perfil cargado exitosamente:', data)
  }
  
  return data
}

export const useAuth = () => {
  // Inicializar solo la primera vez
  if (!isInitialized.value) {
    initializeAuth()
  }

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isCustomer = computed(() => profile.value?.role === 'customer')

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error && data.user) {
      user.value = data.user
      await getProfile()
    }
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      user.value = null
      profile.value = null
    }
    return { error }
  }

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      user.value = data.user
      await getProfile()
    }
  }

  return {
    user,
    profile,
    isAuthenticated,
    isAdmin,
    isCustomer,
    getProfile,
    signIn,
    signUp,
    signOut,
    loadUser
  }
}