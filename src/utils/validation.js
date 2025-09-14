// Form validation utilities for the Traveal app
// Comprehensive validation rules and error messages

export const ValidationRules = {
  // Email validation
  email: {
    required: (value) => !value || value.trim() === '',
    format: (value) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    getMessage: (rule, field = 'Email') => {
      switch (rule) {
        case 'required': return `${field} is required`
        case 'format': return 'Please enter a valid email address'
        default: return `${field} is invalid`
      }
    }
  },

  // Password validation with security requirements
  password: {
    required: (value) => !value || value.trim() === '',
    minLength: (value) => value && value.length < 8,
    hasUppercase: (value) => value && !/[A-Z]/.test(value),
    hasLowercase: (value) => value && !/[a-z]/.test(value),
    hasNumber: (value) => value && !/\d/.test(value),
    hasSpecialChar: (value) => value && !/[!@#$%^&*(),.?":{}|<>]/.test(value),
    notCommon: (value) => {
      const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123']
      return value && commonPasswords.includes(value.toLowerCase())
    },
    getMessage: (rule, field = 'Password') => {
      switch (rule) {
        case 'required': return `${field} is required`
        case 'minLength': return 'Password must be at least 8 characters long'
        case 'hasUppercase': return 'Password must contain at least one uppercase letter'
        case 'hasLowercase': return 'Password must contain at least one lowercase letter'
        case 'hasNumber': return 'Password must contain at least one number'
        case 'hasSpecialChar': return 'Password must contain at least one special character'
        case 'notCommon': return 'Password is too common, please choose a stronger password'
        default: return `${field} is invalid`
      }
    }
  },

  // Phone number validation
  phone: {
    required: (value) => !value || value.trim() === '',
    format: (value) => {
      if (!value) return false
      // Remove all non-digit characters except +
      const cleaned = value.replace(/[^\d+]/g, '')
      // Check if it's a valid international format or local format
      return !/^[\+]?[1-9][\d]{0,15}$/.test(cleaned)
    },
    getMessage: (rule, field = 'Phone number') => {
      switch (rule) {
        case 'required': return `${field} is required`
        case 'format': return 'Please enter a valid phone number'
        default: return `${field} is invalid`
      }
    }
  },

  // Name validation
  name: {
    required: (value) => !value || value.trim() === '',
    minLength: (value) => value && value.trim().length < 2,
    maxLength: (value) => value && value.length > 50,
    format: (value) => value && !/^[a-zA-Z\s'-]+$/.test(value),
    getMessage: (rule, field = 'Name') => {
      switch (rule) {
        case 'required': return `${field} is required`
        case 'minLength': return `${field} must be at least 2 characters long`
        case 'maxLength': return `${field} must be less than 50 characters`
        case 'format': return `${field} can only contain letters, spaces, hyphens, and apostrophes`
        default: return `${field} is invalid`
      }
    }
  },

  // Age group validation
  ageGroup: {
    required: (value) => !value || value === '',
    getMessage: (rule, field = 'Age group') => {
      switch (rule) {
        case 'required': return 'Please select your age group'
        default: return `${field} is invalid`
      }
    }
  },

  // Generic text validation
  text: {
    required: (value) => !value || value.trim() === '',
    minLength: (value, min = 1) => value && value.trim().length < min,
    maxLength: (value, max = 255) => value && value.length > max,
    getMessage: (rule, field = 'Field', min = 1, max = 255) => {
      switch (rule) {
        case 'required': return `${field} is required`
        case 'minLength': return `${field} must be at least ${min} characters long`
        case 'maxLength': return `${field} must be less than ${max} characters`
        default: return `${field} is invalid`
      }
    }
  }
}

// Main validation function
export const validateField = (value, rules, fieldName = 'Field') => {
  const errors = []
  
  if (!rules || typeof rules !== 'object') return errors
  
  Object.keys(rules).forEach(rule => {
    if (rules[rule] && typeof ValidationRules[fieldName]?.[rule] === 'function') {
      if (ValidationRules[fieldName][rule](value)) {
        errors.push(ValidationRules[fieldName].getMessage(rule, fieldName.charAt(0).toUpperCase() + fieldName.slice(1)))
      }
    }
  })
  
  return errors
}

// Validate entire form
export const validateForm = (formData, validationSchema) => {
  const errors = {}
  
  Object.keys(validationSchema).forEach(fieldName => {
    const fieldValue = formData[fieldName]
    const fieldRules = validationSchema[fieldName]
    const fieldErrors = validateField(fieldValue, fieldRules, fieldName)
    
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors
    }
  })
  
  return errors
}

// Password strength checker
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Very Weak', color: 'text-red-500' }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    notCommon: !['password', '123456', '123456789', 'qwerty', 'abc123'].includes(password.toLowerCase())
  }
  
  Object.values(checks).forEach(check => {
    if (check) score++
  })
  
  if (score < 3) return { score, label: 'Weak', color: 'text-red-500' }
  if (score < 5) return { score, label: 'Fair', color: 'text-yellow-500' }
  if (score < 6) return { score, label: 'Good', color: 'text-blue-500' }
  return { score, label: 'Strong', color: 'text-green-500' }
}

// Real-time validation hook
export const useFormValidation = (initialData, validationSchema) => {
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  
  const validateSingleField = (fieldName, value) => {
    const fieldRules = validationSchema[fieldName]
    if (!fieldRules) return []
    
    return validateField(value, fieldRules, fieldName)
  }
  
  const handleChange = (fieldName, value) => {
    setData(prev => ({ ...prev, [fieldName]: value }))
    
    // Real-time validation for touched fields
    if (touched[fieldName]) {
      const fieldErrors = validateSingleField(fieldName, value)
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors.length > 0 ? fieldErrors : undefined
      }))
    }
  }
  
  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    const fieldErrors = validateSingleField(fieldName, data[fieldName])
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors.length > 0 ? fieldErrors : undefined
    }))
  }
  
  const validateAll = () => {
    const allErrors = validateForm(data, validationSchema)
    setErrors(allErrors)
    setTouched(Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {}))
    
    return Object.keys(allErrors).length === 0
  }
  
  const reset = () => {
    setData(initialData)
    setErrors({})
    setTouched({})
  }
  
  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}

// Cross-field validation utilities
export const CrossFieldValidation = {
  passwordMatch: (password, confirmPassword) => {
    return password === confirmPassword
  },
  
  dateRange: (startDate, endDate) => {
    if (!startDate || !endDate) return true
    return new Date(startDate) <= new Date(endDate)
  },
  
  futureDate: (date) => {
    if (!date) return true
    return new Date(date) <= new Date()
  },
  
  duplicateLocation: (origin, destination) => {
    if (!origin || !destination) return true
    return origin.toLowerCase().trim() !== destination.toLowerCase().trim()
  }
}

export default {
  ValidationRules,
  validateField,
  validateForm,
  getPasswordStrength,
  useFormValidation,
  CrossFieldValidation
}