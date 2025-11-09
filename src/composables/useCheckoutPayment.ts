// src/composables/useCheckoutPayment.ts

import { ref, computed, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'
import type { ShippingOption } from '@/types/shipping'

interface PaymentForm {
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

interface ValidationErrors {
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
  [key: string]: string
}

interface CheckoutForm {
  email: string
  newsletter: boolean
  country: string
  documentType: string
  firstName: string
  lastName: string
  documentId: string
  address: string
  apartment: string
  postalCode: string
  district: string
  province: string
  phone: string
}

const cleanText = (text: string | null | undefined, defaultValue: string = ''): string => {
  if (!text) return defaultValue
  const cleaned = String(text).trim()
  return cleaned === '' ? defaultValue : cleaned
}

const getCleanDeliveryTime = (shippingOption: ShippingOption | null): string => {
  if (!shippingOption) return 'Disponible inmediatamente'
  
  const deliveryTime = cleanText(shippingOption.deliveryTime)
  
  if (deliveryTime !== '') {
    return deliveryTime
  }
  
  const defaultTimes: Record<string, string> = {
    'pickup': 'Disponible inmediatamente',
    'express-lima': '24 horas',
    'regular-lima': '3-5 días hábiles',
    'province': '3-7 días hábiles',
    'international': '~15 días hábiles'
  }
  
  return defaultTimes[shippingOption.id] || 'Según método seleccionado'
}

export function useCheckoutPayment(
  paymentForm: Ref<PaymentForm>,
  errors: Ref<ValidationErrors>,
  checkoutForm: Ref<CheckoutForm>,
  selectedShippingOption: Ref<ShippingOption | null>,
  shippingCost: Ref<number>,
  finalTotal: Ref<number>,
  isFormValid: Ref<boolean>
) {
  const router = useRouter()
  const cartStore = useCartStore()
  const { isAuthenticated, user } = useAuth()
  const isProcessing = ref(false)
  const showSuccessModal = ref(false)

  const hasErrors = computed(() => Object.values(errors.value).some(e => e !== ''))

  // Validaciones de tarjeta
  const formatCardNumber = () => {
    const value = paymentForm.value.cardNumber.replace(/\s/g, '').replace(/\D/g, '').substring(0, 16)
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value
    paymentForm.value.cardNumber = formatted
    errors.value.cardNumber = (value.length > 0 && value.length < 16) ? 'Debe tener 16 dígitos' : ''
  }

  const validateCardName = () => {
    const cleaned = paymentForm.value.cardName.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase()
    paymentForm.value.cardName = cleaned
    errors.value.cardName = (cleaned.length > 0 && cleaned.length < 3) ? 'Mínimo 3 caracteres' : ''
  }

const formatExpiryDate = () => {
  // Obtener solo los números
  let value = paymentForm.value.expiryDate.replace(/\D/g, '')
  
  // Limitar a 4 dígitos
  value = value.substring(0, 4)
  
  if (value.length >= 2) {
    let month = value.substring(0, 2)
    let year = value.substring(2, 4)
    
    // 🔥 VALIDAR MES (01-12) - Solo si hay 2 dígitos completos
    if (month.length === 2) {
      const monthNum = parseInt(month)
      if (monthNum > 12) {
        month = '12'
        value = month + year
      } else if (monthNum === 0) {
        month = '01'
        value = month + year
      }
    }
    
    // 🔥 VALIDAR AÑO (no menor a 25) - Solo si hay 2 dígitos completos
    if (year.length === 2) {
      const yearNum = parseInt(year)
      const currentYear = new Date().getFullYear() % 100
      
      if (yearNum < currentYear) {
        year = currentYear.toString().padStart(2, '0')
        value = month + year
      }
    }
    
    // Formatear con /
    paymentForm.value.expiryDate = month + (year ? '/' + year : '')
  } else {
    // Si hay menos de 2 dígitos, solo mostrar lo que hay
    paymentForm.value.expiryDate = value
  }
  
  // 🔥 VALIDAR FORMATO COMPLETO Y FECHA NO EXPIRADA
  if (paymentForm.value.expiryDate.length === 5) {
    const [m, y] = paymentForm.value.expiryDate.split('/')
    const monthNum = parseInt(m)
    const yearNum = parseInt(y)
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      errors.value.expiryDate = 'Tarjeta expirada'
    } else if (monthNum < 1 || monthNum > 12) {
      errors.value.expiryDate = 'Mes inválido (01-12)'
    } else {
      errors.value.expiryDate = ''
    }
  } else if (paymentForm.value.expiryDate.length > 0) {
    errors.value.expiryDate = 'Formato: MM/AA'
  } else {
    errors.value.expiryDate = ''
  }
}

  const validateCVV = () => {
    const value = paymentForm.value.cvv.replace(/\D/g, '').substring(0, 4)
    paymentForm.value.cvv = value
    errors.value.cvv = (value.length > 0 && value.length < 3) ? 'Mínimo 3 dígitos' : ''
  }

  const isPaymentValid = computed(() =>
    paymentForm.value.cardNumber.replace(/\s/g, '').length === 16 &&
    paymentForm.value.cardName.trim().length >= 3 &&
    paymentForm.value.expiryDate.length === 5 &&
    paymentForm.value.cvv.length >= 3 &&
    !hasErrors.value
  )

  const canProceedToPayment = computed(() =>
    cartStore.items.length > 0 && isFormValid.value && !hasErrors.value && !isProcessing.value &&
    selectedShippingOption.value !== null && isPaymentValid.value
  )

  // 🔥 NUEVA: Validar stock ANTES de procesar el pago
  const validateStock = async (): Promise<{ valid: boolean; errors: string[] }> => {
    const stockErrors: string[] = []
    
    for (const item of cartStore.items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('stock, name')
        .eq('id', item.id)
        .single()

      if (error || !product) {
        stockErrors.push(`No se pudo verificar "${item.name}"`)
        continue
      }

      if (product.stock === 0) {
        stockErrors.push(`"${product.name}" está agotado`)
      } else if (product.stock < item.quantity) {
        stockErrors.push(`"${product.name}" solo tiene ${product.stock} unidades disponibles (intentas comprar ${item.quantity})`)
      }
    }

    return {
      valid: stockErrors.length === 0,
      errors: stockErrors
    }
  }

  // 🔥 MEJORADA: Actualizar stock con verificación completa
  const updateStock = async () => {
    const updates = []
    
    for (const item of cartStore.items) {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock, name')
        .eq('id', item.id)
        .single()

      if (fetchError || !product) {
        throw new Error(`Error al verificar stock de "${item.name}"`)
      }

      const newStock = product.stock - item.quantity

      if (newStock < 0) {
        throw new Error(`Stock insuficiente para "${item.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`)
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id)

      if (updateError) {
        throw new Error(`Error al actualizar stock de "${item.name}": ${updateError.message}`)
      }

      const { data: verified, error: verifyError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.id)
        .single()

      if (verifyError || !verified) {
        throw new Error(`No se pudo verificar la actualización de "${item.name}"`)
      }

      updates.push({
        name: item.name,
        previousStock: product.stock,
        newStock: verified.stock,
        quantity: item.quantity
      })
    }

    return updates
  }

  const sendOrderConfirmationEmail = async (orderData: { id: string; created_at: string }) => {
    if (!selectedShippingOption.value) return false
    try {
      const cleanedDeliveryTime = getCleanDeliveryTime(selectedShippingOption.value)
      
      await supabase.functions.invoke('send-order-email-gmail', {
        body: {
          order: {
            id: orderData.id,
            user_id: user.value?.id || '',
            user_email: checkoutForm.value.email,
            total: finalTotal.value,
            status: 'completed',
            delivery_method: selectedShippingOption.value.id,
            shipping_address: {
              firstName: cleanText(checkoutForm.value.firstName, 'Cliente'),
              lastName: cleanText(checkoutForm.value.lastName),
              documentType: cleanText(checkoutForm.value.documentType, 'DNI'),
              documentId: cleanText(checkoutForm.value.documentId, 'No especificado'),
              email: cleanText(checkoutForm.value.email),
              phone: cleanText(checkoutForm.value.phone, 'No especificado'),
              country: cleanText(checkoutForm.value.country, 'PE'),
              address: cleanText(checkoutForm.value.address, 'Dirección no especificada'),
              apartment: cleanText(checkoutForm.value.apartment),
              district: cleanText(checkoutForm.value.district, 'Distrito'),
              province: cleanText(checkoutForm.value.province, 'Provincia'),
              postalCode: cleanText(checkoutForm.value.postalCode),
              shippingMethod: cleanText(selectedShippingOption.value.label, 'Método de envío'),
              deliveryTime: cleanedDeliveryTime,
              shippingCost: shippingCost.value
            },
            created_at: orderData.created_at
          },
          items: cartStore.items.map(item => ({
            id: crypto.randomUUID(),
            order_id: orderData.id,
            product_id: item.id,
            product_name: cleanText(item.name, 'Producto'),
            product_price: item.price,
            product_size: cleanText(item.size),
            product_color: cleanText(item.color),
            product_image_url: cleanText(item.image_url),
            quantity: item.quantity,
            subtotal: item.price * item.quantity
          }))
        }
      })
      return true
    } catch {
      return false
    }
  }

  const proceedToPayment = async () => {
    if (cartStore.items.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de continuar.')
      return
    }

    if (!isAuthenticated.value || !user.value) {
      alert('Debes iniciar sesión para completar tu compra')
      router.push('/signin')
      return
    }

    if (!selectedShippingOption.value) {
      alert('Por favor selecciona un método de envío')
      return
    }

    if (!canProceedToPayment.value) return

    try {
      isProcessing.value = true

      const stockValidation = await validateStock()
      
      if (!stockValidation.valid) {
        const errorMessage = 'Problemas con el stock:\n\n' + stockValidation.errors.join('\n')
        alert(errorMessage)
        isProcessing.value = false
        return
      }

      const stockUpdates = await updateStock()
      
      if (!stockUpdates || stockUpdates.length === 0) {
        throw new Error('No se pudo actualizar el stock de los productos')
      }
      
      // 🔥 PASO 3: Crear orden en la base de datos
      const cleanedDeliveryTime = getCleanDeliveryTime(selectedShippingOption.value)
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.value.id,
          user_email: user.value.email || checkoutForm.value.email,
          total: finalTotal.value,
          status: 'completed',
          delivery_method: selectedShippingOption.value.id,
          shipping_address: {
            firstName: cleanText(checkoutForm.value.firstName, 'Cliente'),
            lastName: cleanText(checkoutForm.value.lastName),
            documentType: cleanText(checkoutForm.value.documentType, 'DNI'),
            documentId: cleanText(checkoutForm.value.documentId, 'No especificado'),
            email: cleanText(checkoutForm.value.email),
            phone: cleanText(checkoutForm.value.phone, 'No especificado'),
            country: cleanText(checkoutForm.value.country, 'PE'),
            address: cleanText(checkoutForm.value.address, 'Dirección no especificada'),
            apartment: cleanText(checkoutForm.value.apartment),
            district: cleanText(checkoutForm.value.district, 'Distrito'),
            province: cleanText(checkoutForm.value.province, 'Provincia'),
            postalCode: cleanText(checkoutForm.value.postalCode),
            shippingMethod: cleanText(selectedShippingOption.value.label, 'Método de envío'),
            shippingCost: shippingCost.value,
            deliveryTime: cleanedDeliveryTime
          }
        })
        .select()
        .single()

      if (orderError) throw new Error('Error al crear la orden: ' + orderError.message)
      
      // 🔥 PASO 4: Guardar items de la orden
      const orderItems = cartStore.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: cleanText(item.name, 'Producto'),
        product_price: item.price,
        product_size: cleanText(item.size),
        product_color: cleanText(item.color),
        product_image_url: cleanText(item.image_url),
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }))
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw new Error('Error al guardar los productos: ' + itemsError.message)
      
      // 🔥 PASO 5: Enviar email de confirmación
      await sendOrderConfirmationEmail(order)

      // 🔥 PASO 6: Limpiar carrito y mostrar éxito
      cartStore.clearCart()
      showSuccessModal.value = true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la compra'
      alert('❌ ' + errorMessage)
    } finally {
      isProcessing.value = false
    }
  }

  const closeSuccessModal = () => {
    showSuccessModal.value = false
    router.push('/shop')
  }

  const goToSignIn = () => {
    router.push('/signin')
  }

  return {
    isProcessing,
    showSuccessModal,
    isPaymentValid,
    canProceedToPayment,
    formatCardNumber,
    validateCardName,
    formatExpiryDate,
    validateCVV,
    proceedToPayment,
    closeSuccessModal,
    goToSignIn
  }
}