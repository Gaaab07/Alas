// composables/useAuth.ts
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import type { User } from '@supabase/supabase-js'

// 🔥 EXPORTAR el tipo Profile
export type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  role: 'admin' | 'customer' | 'owner'
  created_at: string
  phone?: string | null
  document_type?: string | null
  document_number?: string | null
  country?: string | null
  address?: string | null
  apartment?: string | null
  district?: string | null
  province?: string | null
  postal_code?: string | null
}

const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)
const isInitialized = ref(false)
const isLoadingProfile = ref(false)

const getProfile = async (): Promise<Profile | null> => {
  if (!user.value) {
    profile.value = null
    return null
  }

  if (isLoadingProfile.value) {
    let attempts = 0
    while (isLoadingProfile.value && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    return profile.value
  }

  isLoadingProfile.value = true

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return await createProfile()
      }
      
      if (!profile.value) {
        profile.value = null
      }
      return profile.value
    }

    if (data) {
      profile.value = data as Profile
      return profile.value
    }

    return profile.value
  } catch {
    return profile.value
  } finally {
    isLoadingProfile.value = false
  }
}

const createProfile = async (): Promise<Profile | null> => {
  if (!user.value) return null

  try {
    const newProfile = {
      id: user.value.id,
      first_name: user.value.user_metadata?.first_name || user.value.email?.split('@')[0] || 'Usuario',
      last_name: user.value.user_metadata?.last_name || null,
      role: 'customer' as const,
      phone: null,
      document_type: null,
      document_number: null,
      country: null,
      address: null,
      apartment: null,
      district: null,
      province: null,
      postal_code: null
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()

    if (error) {
      return null
    }

    profile.value = data as Profile
    return profile.value
  } catch {
    return null
  }
}

const initializeAuth = async () => {
  if (isInitialized.value) {
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      user.value = session.user
      await getProfile()
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user || null
      
      if (newUser?.id !== user.value?.id) {
        user.value = newUser
        profile.value = null
        
        if (user.value) {
          await getProfile()
        }
      } else if (user.value && !profile.value) {
        await getProfile()
      }
    })

    isInitialized.value = true
  } catch {
    // Error silencioso
  }
}

export const useAuth = () => {
  if (!isInitialized.value) {
    initializeAuth()
  }

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isCustomer = computed(() => profile.value?.role === 'customer')
  const isOwner = computed(() => profile.value?.role === 'owner')
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
      
      let attempts = 0
      const maxAttempts = 3
      
      while (attempts < maxAttempts) {
        await getProfile()
        
        if (profile.value?.role) {
          break
        }
        
        attempts++
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
    } else {
      user.value = null
      profile.value = null
    }
  }

  const refreshProfile = async () => {
    profile.value = null
    return await getProfile()
  }

  return {
    user,
    profile,
    isAuthenticated,
    isAdmin,
    isOwner,
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