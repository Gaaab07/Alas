import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'
import type { User } from '@supabase/supabase-js'
import { nextTick } from 'vue'

// Mock de Supabase
vi.mock('@/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis()
    }))
  }
}))

describe('useAuth Composable', () => {
  // Helper para resetear completamente el estado
  const resetAuthState = () => {
    const auth = useAuth()
    auth.user.value = null
    auth.profile.value = null
  }

  beforeEach(async () => {
    // Mock getSession para evitar inicialización automática
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })
    
    // Resetear estado del composable
    resetAuthState()
    
    // Esperar a que se completen las actualizaciones reactivas
    await nextTick()
  })

  const mockUser: User = {
    id: 'user-123',
    email: 'test@test.com',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {
      first_name: 'Juan',
      last_name: 'Pérez'
    },
    created_at: '2024-01-01T00:00:00Z'
  } as User

  const mockProfile = {
    id: 'user-123',
    first_name: 'Juan',
    last_name: 'Pérez',
    role: 'customer' as const,
    created_at: '2024-01-01T00:00:00Z',
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

  describe('Estado Inicial', () => {
    it('debe inicializar con usuario null', () => {
      const { user } = useAuth()
      expect(user.value).toBeNull()
    })

    it('debe inicializar con profile null', () => {
      const { profile } = useAuth()
      expect(profile.value).toBeNull()
    })

    it('debe inicializar como no autenticado', () => {
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })

    it('isLoadingProfile debe ser false inicialmente', () => {
      const { isLoadingProfile } = useAuth()
      expect(isLoadingProfile.value).toBe(false)
    })
  })

  describe('signIn - Login', () => {
    it('debe hacer login exitosamente y cargar profile', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { 
          user: mockUser, 
          session: { 
            user: mockUser,
            access_token: 'token',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            refresh_token: 'refresh'
          } 
        },
        error: null
      } as never)

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      } as never)

      const { signIn, user, profile } = useAuth()
      const result = await signIn('test@test.com', 'password123')

      expect(result.error).toBeNull()
      expect(user.value).toEqual(mockUser)
      expect(profile.value).toEqual(mockProfile)
    })

    it('debe manejar credenciales inválidas', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 400
        }
      } as never)

      const { signIn, user } = useAuth()
      const result = await signIn('test@test.com', 'wrongpassword')

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toContain('Invalid')
      expect(user.value).toBeNull()
    })

    it('debe crear profile si no existe (error PGRST116)', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { 
          user: mockUser, 
          session: { 
            user: mockUser,
            access_token: 'token',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            refresh_token: 'refresh'
          } 
        },
        error: null
      } as never)

      let callCount = 0
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Primera llamada: profile no existe
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          } as never
        } else {
          // Segunda llamada: insertar profile
          return {
            insert: vi.fn(() => ({
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            }))
          } as never
        }
      })

      const { signIn, profile } = useAuth()
      await signIn('test@test.com', 'password')

      expect(profile.value).toEqual(mockProfile)
      expect(callCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('signUp - Registro', () => {
    it('debe registrar usuario exitosamente', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      } as never)

      const { signUp } = useAuth()
      const result = await signUp('nuevo@test.com', 'password123', 'Juan Pérez')

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'nuevo@test.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Juan Pérez'
          }
        }
      })
      expect(result.error).toBeNull()
    })

    it('debe manejar email ya registrado', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'User already registered',
          status: 422
        }
      } as never)

      const { signUp } = useAuth()
      const result = await signUp('existente@test.com', 'password', 'Test')

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toContain('already registered')
    })
  })

  describe('signOut - Cerrar Sesión', () => {
    it('debe cerrar sesión y limpiar datos', async () => {
      const { user, profile, signOut } = useAuth()
      
      // Establecer estado inicial
      user.value = mockUser
      profile.value = mockProfile

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      await signOut()

      expect(user.value).toBeNull()
      expect(profile.value).toBeNull()
    })

    it('debe manejar error al cerrar sesión', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: {
          message: 'Logout failed',
          status: 500
        }
      } as never)

      const { signOut } = useAuth()
      const result = await signOut()

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toContain('Logout failed')
    })
  })

  describe('getProfile', () => {
    it('debe obtener profile de usuario existente', async () => {
      const { user, getProfile, profile } = useAuth()
      user.value = mockUser

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      } as never)

      const result = await getProfile()

      expect(result).toEqual(mockProfile)
      expect(profile.value).toEqual(mockProfile)
    })

    it('debe retornar null si no hay usuario', async () => {
      const { getProfile } = useAuth()
      const result = await getProfile()

      expect(result).toBeNull()
    })

    it('debe crear profile si no existe', async () => {
      const { user, getProfile, profile } = useAuth()
      user.value = mockUser

      let callCount = 0
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          } as never
        } else {
          return {
            insert: vi.fn(() => ({
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            }))
          } as never
        }
      })

      const result = await getProfile()

      expect(result).toEqual(mockProfile)
      expect(profile.value).toEqual(mockProfile)
    })
  })

  describe('loadUser', () => {
    it('debe cargar usuario y profile', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      } as never)

      const { loadUser, user, profile } = useAuth()
      await loadUser()

      expect(user.value).toEqual(mockUser)
      expect(profile.value).toEqual(mockProfile)
    })

    it('debe limpiar datos si no hay usuario', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      } as never)

      const { loadUser, user, profile } = useAuth()
      await loadUser()

      expect(user.value).toBeNull()
      expect(profile.value).toBeNull()
    })

    it('debe reintentar cargar profile hasta 3 veces si falla', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      let attempts = 0
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          attempts++
          if (attempts < 3) {
            return Promise.resolve({
              data: { ...mockProfile, role: null },
              error: null
            })
          }
          return Promise.resolve({
            data: mockProfile,
            error: null
          })
        })
      } as never)

      const { loadUser } = useAuth()
      await loadUser()

      expect(attempts).toBe(3)
    })
  })

  describe('refreshProfile', () => {
    it('debe limpiar y recargar profile', async () => {
      const { user, profile, refreshProfile } = useAuth()
      user.value = mockUser
      profile.value = mockProfile

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockProfile, first_name: 'Juan Updated' },
          error: null
        })
      } as never)

      const result = await refreshProfile()

      expect(result?.first_name).toBe('Juan Updated')
      expect(profile.value?.first_name).toBe('Juan Updated')
    })

    it('debe retornar null si no hay usuario', async () => {
      const { user, refreshProfile } = useAuth()
      user.value = null

      const result = await refreshProfile()

      expect(result).toBeNull()
    })
  })

  describe('Computed Properties', () => {
    it('isAuthenticated debe ser true cuando hay usuario', async () => {
      const { user, isAuthenticated } = useAuth()
      
      expect(isAuthenticated.value).toBe(false)
      
      user.value = mockUser
      await nextTick()
      
      expect(isAuthenticated.value).toBe(true)
    })

    it('isAdmin debe ser true para admin', async () => {
      const { profile, isAdmin } = useAuth()
      
      expect(isAdmin.value).toBe(false)
      
      profile.value = { ...mockProfile, role: 'admin' }
      await nextTick()
      
      expect(isAdmin.value).toBe(true)
    })

    it('isCustomer debe ser true para customer', async () => {
      const { profile, isCustomer } = useAuth()
      
      profile.value = mockProfile
      await nextTick()
      
      expect(isCustomer.value).toBe(true)
    })

    it('isOwner debe ser true para owner', async () => {
      const { profile, isOwner } = useAuth()
      
      profile.value = { ...mockProfile, role: 'owner' }
      await nextTick()
      
      expect(isOwner.value).toBe(true)
    })

    it('hasAdminAccess debe ser true para admin y owner', async () => {
      const { profile, hasAdminAccess } = useAuth()
      
      profile.value = mockProfile
      await nextTick()
      expect(hasAdminAccess.value).toBe(false)
      
      profile.value = { ...mockProfile, role: 'admin' }
      await nextTick()
      expect(hasAdminAccess.value).toBe(true)
      
      profile.value = { ...mockProfile, role: 'owner' }
      await nextTick()
      expect(hasAdminAccess.value).toBe(true)
    })
  })

  describe('Casos Edge', () => {
    it('debe prevenir múltiples cargas simultáneas de profile', async () => {
      const { user, getProfile, profile } = useAuth()
      user.value = mockUser

      let callCount = 0
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          callCount++
          return new Promise(resolve => setTimeout(() => resolve({
            data: mockProfile,
            error: null
          }), 50))
        })
      } as never)

      const [result1, result2, result3] = await Promise.all([
        getProfile(),
        getProfile(),
        getProfile()
      ])

      expect(result1).toEqual(mockProfile)
      expect(result2).toEqual(mockProfile)
      expect(result3).toEqual(mockProfile)
      expect(callCount).toBe(1)
      expect(profile.value).toEqual(mockProfile)
    })

    it('debe crear profile con nombre desde email si no hay metadata', async () => {
      const userWithoutName = {
        ...mockUser,
        user_metadata: {},
        email: 'test@example.com'
      }

      const { user, getProfile } = useAuth()
      user.value = userWithoutName as User

      let insertCalled = false
      let callCount = 0
      
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          } as never
        } else {
          return {
            insert: vi.fn((profiles: unknown) => {
              insertCalled = true
              const profileArray = profiles as typeof mockProfile[]
              expect(profileArray[0].first_name).toBe('test')
              return {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                  data: { ...mockProfile, first_name: 'test' },
                  error: null
                })
              }
            })
          } as never
        }
      })

      await getProfile()

      expect(insertCalled).toBe(true)
    })

    it('debe manejar error al cargar profile sin crear uno nuevo', async () => {
      const { user, getProfile, profile } = useAuth()
      user.value = mockUser

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST999', message: 'Database error' }
        })
      } as never)

      const result = await getProfile()

      expect(result).toBeNull()
      expect(profile.value).toBeNull()
    })
  })
})