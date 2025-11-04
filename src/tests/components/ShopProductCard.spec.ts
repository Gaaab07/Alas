import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ShopProductCard from '@/components/ShopProductCard.vue'

describe('ShopProductCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const defaultProps = {
    id: '1',
    name: 'Producto Test',
    price: 99.99,
    stock: 10,
    category: 'camiseta',
    image_url: 'https://example.com/image.jpg'
  }

  it('debe renderizar correctamente', () => {
    const wrapper = mount(ShopProductCard, {
      props: defaultProps
    })
    
    expect(wrapper.text()).toContain('Producto Test')
    expect(wrapper.text()).toContain('99.99')
  })

  it('debe mostrar badge "Agotado" cuando stock = 0', () => {
    const wrapper = mount(ShopProductCard, {
      props: { ...defaultProps, stock: 0 }
    })
    
    expect(wrapper.text()).toContain('Agotado')
  })

  it('debe deshabilitar botón cuando stock = 0', () => {
    const wrapper = mount(ShopProductCard, {
      props: { ...defaultProps, stock: 0 }
    })
    
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('debe mostrar precio formateado correctamente', () => {
    const wrapper = mount(ShopProductCard, {
      props: { ...defaultProps, price: 100 }
    })
    
    expect(wrapper.text()).toContain('100.00')
  })

  it('debe tener clase "out-of-stock" cuando stock = 0', () => {
    const wrapper = mount(ShopProductCard, {
      props: { ...defaultProps, stock: 0 }
    })
    
    expect(wrapper.classes()).toContain('out-of-stock')
  })

  it('debe mostrar imagen con src correcto', () => {
    const wrapper = mount(ShopProductCard, {
      props: defaultProps
    })
    
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe(defaultProps.image_url)
  })

  it('debe usar imagen placeholder si no hay image_url', () => {
    const wrapper = mount(ShopProductCard, {
      props: { ...defaultProps, image_url: null }
    })
    
    const img = wrapper.find('img')
    expect(img.attributes('src')).toContain('unsplash.com')
  })
})