// src/utils/checkoutConfig.ts

export const COUNTRY_VALIDATION = {
  PE: { postal: { maxLength: 5 }, phone: { maxLength: 9 } },
  AR: { postal: { maxLength: 8 }, phone: { maxLength: 10 } },
  CL: { postal: { maxLength: 7 }, phone: { maxLength: 9 } },
  CO: { postal: { maxLength: 6 }, phone: { maxLength: 10 } },
  MX: { postal: { maxLength: 5 }, phone: { maxLength: 10 } },
  US: { postal: { maxLength: 5 }, phone: { maxLength: 10 } }
}

export const DOCUMENT_TYPES = {
  PE: [
    { value: 'dni', label: 'DNI - Documento Nacional de Identidad', maxLength: 8, hint: '8 dígitos', numeric: true },
    { value: 'ce', label: 'Carné de Extranjería', maxLength: 12, hint: '12 caracteres alfanuméricos', numeric: false },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  AR: [
    { value: 'dni', label: 'DNI - Documento Nacional de Identidad', maxLength: 8, hint: '8 dígitos', numeric: true },
    { value: 'cuil', label: 'CUIL/CUIT', maxLength: 11, hint: '11 dígitos', numeric: true },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  CL: [
    { value: 'rut', label: 'RUT - Rol Único Tributario', maxLength: 9, hint: '9 dígitos', numeric: true },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  CO: [
    { value: 'cc', label: 'Cédula de Ciudadanía', maxLength: 11, hint: 'Hasta 11 dígitos', numeric: true },
    { value: 'ce', label: 'Cédula de Extranjería', maxLength: 11, hint: 'Hasta 11 dígitos', numeric: true },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  MX: [
    { value: 'curp', label: 'CURP - Clave Única de Registro', maxLength: 18, hint: '18 caracteres', numeric: false },
    { value: 'ine', label: 'INE - Credencial de Elector', maxLength: 13, hint: '13 dígitos', numeric: true },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  US: [
    { value: 'ssn', label: 'SSN - Social Security Number', maxLength: 9, hint: '9 dígitos', numeric: true },
    { value: 'drivers', label: 'Driver License', maxLength: 15, hint: 'Hasta 15 caracteres', numeric: false },
    { value: 'passport', label: 'Passport', maxLength: 12, hint: 'Up to 12 characters', numeric: false }
  ]
}

export const DISTRICT_LABELS: Record<string, string> = {
  PE: 'Distrito *',
  AR: 'Ciudad',
  CL: 'Comuna',
  CO: 'Ciudad',
  MX: 'Municipio',
  US: 'City'
}

export const DISTRICT_PLACEHOLDERS: Record<string, string> = {
  PE: 'Ej: Miraflores',
  AR: 'Ej: Palermo',
  CL: 'Ej: Providencia',
  CO: 'Ej: Chapinero',
  MX: 'Ej: Polanco',
  US: 'Ex: Manhattan'
}