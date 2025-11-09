// src/tests/setup.ts
import { afterEach, vi } from 'vitest'
import { config } from '@vue/test-utils'

// Configuración global de Vue Test Utils
config.global.mocks = {
  $route: {
    params: {}
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn()
  }
}

// Limpiar todos los mocks después de cada test
afterEach(() => {
  vi.clearAllMocks()
})

// ✅ AGREGAR: Mock de alert y confirm (crítico para cart.ts)
global.alert = vi.fn()
global.confirm = vi.fn(() => true)

// Mock de window.matchMedia (necesario para algunos tests de Bootstrap)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver