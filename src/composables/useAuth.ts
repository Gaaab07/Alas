// composables/useAuth.ts
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import type { User } from '@supabase/supabase-js'

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'customer'
  created_at: string
}

// ✅ Estado global compartido
const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)
const isInitialized = ref(false)
const isLoadingProfile = ref(false)

// Función para obtener el perfil
const getProfile = async (): Promise<Profile | null> => {
  if (!user.value) {
    console.log('❌ No hay usuario para obtener perfil')
    profile.value = null
    return null
  }

  // Si ya está cargando, esperar a que termine
  if (isLoadingProfile.value) {
    console.log('⏳ Ya se está cargando el perfil, esperando...')
    let attempts = 0
    while (isLoadingProfile.value && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    console.log('✅ Perfil ya disponible:', profile.value?.role)
    return profile.value
  }

  isLoadingProfile.value = true
  console.log('🔍 Obteniendo perfil para usuario:', user.value.id)

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('❌ Error obteniendo perfil:', error)
      
      // Si el perfil no existe, intentar crearlo
      if (error.code === 'PGRST116') {
        console.log('⚠️ Perfil no existe, creando uno...')
        return await createProfile()
      }
      
      // NO limpiar el perfil si ya existe uno válido
      if (!profile.value) {
        profile.value = null
      }
      return profile.value
    }

    if (data) {
      profile.value = data as Profile
      console.log('✅ Perfil cargado:', profile.value)
      return profile.value
    }

    return profile.value
  } catch (err) {
    console.error('❌ Excepción en getProfile:', err)
    // Mantener el perfil existente en caso de error
    return profile.value
  } finally {
    isLoadingProfile.value = false
  }
}

// Crear perfil si no existe
const createProfile = async (): Promise<Profile | null> => {
  if (!user.value) return null

  console.log('🆕 Creando perfil para usuario:', user.value.id)

  try {
    const newProfile = {
      id: user.value.id,
      full_name: user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || 'Usuario',
      avatar_url: user.value.user_metadata?.avatar_url || null,
      role: 'customer' as const // Por defecto customer, cambiar manualmente a admin
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando perfil:', error)
      return null
    }

    profile.value = data as Profile
    console.log('✅ Perfil creado:', profile.value)
    return profile.value
  } catch (err) {
    console.error('❌ Excepción creando perfil:', err)
    return null
  }
}

// Inicialización
const initializeAuth = async () => {
  if (isInitialized.value) {
    console.log('✅ Auth ya inicializado')
    return
  }

  console.log('🚀 Inicializando autenticación...')

  try {
    // Obtener sesión actual
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      user.value = session.user
      console.log('👤 Usuario encontrado:', user.value.email)
      await getProfile()
    } else {
      console.log('❌ No hay sesión activa')
    }

    // Listener de cambios de auth
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event)
      
      const newUser = session?.user || null
      
      // Solo actualizar si el usuario realmente cambió
      if (newUser?.id !== user.value?.id) {
        console.log('👤 Usuario cambió, actualizando...')
        user.value = newUser
        profile.value = null // Solo limpiar si cambió el usuario
        
        if (user.value) {
          await getProfile()
        }
      } else if (user.value && !profile.value) {
        // Si hay usuario pero no perfil, cargar el perfil
        console.log('⚠️ Usuario existe pero falta perfil, cargando...')
        await getProfile()
      } else {
        console.log('✅ Usuario sin cambios, manteniendo perfil actual')
      }
    })

    isInitialized.value = true
    console.log('✅ Autenticación inicializada')
  } catch (error) {
    console.error('❌ Error inicializando auth:', error)
  }
}

export const useAuth = () => {
  // Inicializar si no se ha hecho
  if (!isInitialized.value) {
    initializeAuth()
  }

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => {
    const result = profile.value?.role === 'admin'
    console.log('🔐 isAdmin computed:', result, 'role:', profile.value?.role)
    return result
  })
  const isCustomer = computed(() => profile.value?.role === 'customer')

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Intentando login...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error && data.user) {
      user.value = data.user
      await getProfile()
      console.log('✅ Login exitoso')
    } else {
      console.error('❌ Error en login:', error)
    }
    
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 Registrando usuario...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (!error && data.user) {
      console.log('✅ Usuario registrado')
      // El perfil se creará automáticamente por el trigger o manualmente
    }

    return { data, error }
  }

  const signOut = async () => {
    console.log('👋 Cerrando sesión...')
    const { error } = await supabase.auth.signOut()
    
    if (!error) {
      user.value = null
      profile.value = null
      console.log('✅ Sesión cerrada')
    }
    
    return { error }
  }

  const loadUser = async () => {
    console.log('🔄 Recargando usuario...')
    const { data } = await supabase.auth.getUser()
    
    if (data.user) {
      user.value = data.user
      
      // Intentar cargar el perfil hasta 3 veces
      let attempts = 0
      const maxAttempts = 3
      
      while (attempts < maxAttempts) {
        await getProfile()
        
        if (profile.value?.role) {
          console.log('✅ Perfil cargado correctamente:', profile.value.role)
          break
        }
        
        attempts++
        if (attempts < maxAttempts) {
          console.log(`⚠️ Intento ${attempts} falló, reintentando...`)
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      if (!profile.value?.role) {
        console.error('❌ No se pudo cargar el perfil después de', maxAttempts, 'intentos')
      }
    } else {
      user.value = null
      profile.value = null
    }
  }

  // Forzar recarga del perfil
  const refreshProfile = async () => {
    console.log('🔄 Forzando recarga de perfil...')
    profile.value = null
    return await getProfile()
  }

  return {
    user,
    profile,
    isAuthenticated,
    isAdmin,
    isCustomer,
    isLoadingProfile,
    getProfile,
    refreshProfile,
    signIn,
    signUp,
    signOut,
    loadUser
  }
}