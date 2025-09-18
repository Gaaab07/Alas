// composables/useAuth.ts
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import type { User } from '@supabase/supabase-js'

// Si tienes la tabla profiles definida, puedes crear un tipo para ella
type Profile = {
  id: string
  full_name: string | null
  role: 'admin' | 'customer' | null
}

const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)

export const useAuth = () => {
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isCustomer = computed(() => profile.value?.role === 'customer')

  const getProfile = async () => {
    if (!user.value) return null
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single<Profile>() // 👈 tipado aquí
    
    if (!error && data) {
      profile.value = data
    }
    return data
  }

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

  onMounted(() => {
    loadUser()
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
      if (user.value) getProfile()
    })
  })

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
