// src/composables/useCheckoutValidation.ts

import { computed, type Ref } from 'vue'
import { COUNTRY_VALIDATION, DOCUMENT_TYPES } from '@/utils/checkoutConfig'

interface CheckoutForm {
  country: string
  documentType: string
  documentId: string
  postalCode: string
  phone: string
  firstName: string
  lastName: string
  email: string
  address: string
  province: string
  district: string
}

interface ValidationErrors {
  firstName: string
  lastName: string
  documentId: string
  postalCode: string
  phone: string
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

export function useCheckoutValidation(
  checkoutForm: Ref<CheckoutForm>,
  errors: Ref<ValidationErrors>,
  isInternational: Ref<boolean>
) {
  
  const availableDocumentTypes = computed(() => {
    return DOCUMENT_TYPES[checkoutForm.value.country as keyof typeof DOCUMENT_TYPES] || []
  })

  const selectedDocumentConfig = computed(() => {
    if (!checkoutForm.value.documentType) return null
    const types = DOCUMENT_TYPES[checkoutForm.value.country as keyof typeof DOCUMENT_TYPES] || []
    return types.find(t => t.value === checkoutForm.value.documentType) || null
  })

  const selectedDocumentLabel = computed(() => selectedDocumentConfig.value?.label || 'Número de Documento')
  
  const selectedDocumentPlaceholder = computed(() => {
    const config = selectedDocumentConfig.value
    return config ? `${config.label} (${config.hint})` : 'Seleccione primero el tipo de documento'
  })
  
  const selectedDocumentMaxLength = computed(() => selectedDocumentConfig.value?.maxLength || 20)
  
  const selectedDocumentHint = computed(() => {
    const config = selectedDocumentConfig.value
    return config ? `Ingrese su ${config.label} - ${config.hint}` : 'Seleccione el tipo de documento primero'
  })

  const postalMaxLength = computed(() => {
    const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
    return cfg?.postal.maxLength || 10
  })

  const postalPlaceholder = computed(() => {
    const max = postalMaxLength.value
    return `Código postal (${max} caracteres)`
  })

  const phoneMaxLength = computed(() => {
    const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
    return cfg?.phone.maxLength || 15
  })

  const phonePlaceholder = computed(() => {
    const max = phoneMaxLength.value
    return `Teléfono (${max} dígitos)`
  })

  const phoneHint = computed(() => {
    const max = phoneMaxLength.value
    return `Ingrese su número de ${max} dígitos`
  })

  // Validaciones
  const validateName = (field: 'firstName' | 'lastName') => {
    const value = checkoutForm.value[field]
    const cleaned = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    checkoutForm.value[field] = cleaned
    errors.value[field] = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) ? '' : 'Solo se permiten letras'
  }

  const onDocumentTypeChange = () => {
    checkoutForm.value.documentId = ''
    errors.value.documentId = ''
  }

  const validateDocumentId = () => {
    const value = checkoutForm.value.documentId
    const config = selectedDocumentConfig.value
    
    if (!config) {
      errors.value.documentId = 'Seleccione el tipo de documento primero'
      return
    }
    
    if (config.numeric) {
      const numbersOnly = value.replace(/\D/g, '').substring(0, config.maxLength)
      checkoutForm.value.documentId = numbersOnly
      errors.value.documentId = (numbersOnly.length > 0 && numbersOnly.length < config.maxLength) 
        ? `Debe tener ${config.maxLength} dígitos` : ''
    } else {
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').substring(0, config.maxLength)
      checkoutForm.value.documentId = cleaned.toUpperCase()
      errors.value.documentId = (cleaned.length > 0 && cleaned.length < 6) ? 'Mínimo 6 caracteres' : ''
    }
  }

  const validatePostalCode = () => {
    const value = checkoutForm.value.postalCode
    const maxLength = postalMaxLength.value
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').substring(0, maxLength)
    checkoutForm.value.postalCode = cleaned.toUpperCase()
    if (isInternational.value) {
      errors.value.postalCode = (cleaned.length > 0 && cleaned.length < maxLength) 
        ? `Debe tener ${maxLength} caracteres` : ''
    } else {
      errors.value.postalCode = ''
    }
  }

  const validatePhone = () => {
    const value = checkoutForm.value.phone
    const numbersOnly = value.replace(/\D/g, '')
    const maxLength = phoneMaxLength.value
    checkoutForm.value.phone = numbersOnly.substring(0, maxLength)
    errors.value.phone = (numbersOnly.length > 0 && numbersOnly.length < maxLength) 
      ? `Debe tener ${maxLength} dígitos` : ''
  }

  return {
    availableDocumentTypes,
    selectedDocumentLabel,
    selectedDocumentPlaceholder,
    selectedDocumentMaxLength,
    selectedDocumentHint,
    postalMaxLength,
    postalPlaceholder,
    phoneMaxLength,
    phonePlaceholder,
    phoneHint,
    validateName,
    onDocumentTypeChange,
    validateDocumentId,
    validatePostalCode,
    validatePhone
  }
}