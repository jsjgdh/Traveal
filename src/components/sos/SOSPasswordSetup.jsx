import { useState, useEffect } from 'react'
import { Eye, EyeOff, Shield, Lock, Users, Settings, Check, AlertTriangle } from 'lucide-react'

function SOSPasswordSetup({ onComplete, onCancel, existingProfile = null }) {
  const [formData, setFormData] = useState({
    fullPassword: '',
    confirmFullPassword: '',
    partialPassword: '',
    confirmPartialPassword: '',
    biometricEnabled: false,
    backgroundPermissions: false,
    voiceLanguage: 'en'
  })
  
  const [showPasswords, setShowPasswords] = useState({
    full: false,
    fullConfirm: false,
    partial: false,
    partialConfirm: false
  })
  
  const [passwordStrength, setPasswordStrength] = useState({
    full: { score: 0, feedback: '' },
    partial: { score: 0, feedback: '' }
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing profile data if editing
  useEffect(() => {
    if (existingProfile) {
      setFormData(prev => ({
        ...prev,
        biometricEnabled: existingProfile.biometricEnabled,
        backgroundPermissions: existingProfile.backgroundPermissions,
        voiceLanguage: existingProfile.voiceLanguage
      }))
    }
  }, [existingProfile])

  const checkPasswordStrength = (password, type) => {
    let score = 0
    let feedback = []
    
    if (password.length >= 8) score++
    else feedback.push('At least 8 characters')
    
    if (/[a-z]/.test(password)) score++
    else feedback.push('lowercase letter')
    
    if (/[A-Z]/.test(password)) score++
    else feedback.push('uppercase letter')
    
    if (/\d/.test(password)) score++
    else feedback.push('number')
    
    if (type === 'full' && /[@$!%*?&]/.test(password)) score++
    else if (type === 'full') feedback.push('special character')
    
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600']
    
    setPasswordStrength(prev => ({
      ...prev,
      [type]: {
        score,
        feedback: feedback.length ? `Missing: ${feedback.join(', ')}` : 'Strong password!',
        level: strengthLevels[Math.min(score, 4)],
        color: strengthColors[Math.min(score, 4)]
      }
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    
    // Check password strength
    if (field === 'fullPassword') {
      checkPasswordStrength(value, 'full')
    } else if (field === 'partialPassword') {
      checkPasswordStrength(value, 'partial')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Full password validation
    if (!formData.fullPassword) {
      newErrors.fullPassword = 'Full password is required'
    } else if (formData.fullPassword.length < 8) {
      newErrors.fullPassword = 'Password must be at least 8 characters'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.fullPassword)) {
      newErrors.fullPassword = 'Password must contain uppercase, lowercase, number, and special character'
    }
    
    if (formData.fullPassword !== formData.confirmFullPassword) {
      newErrors.confirmFullPassword = 'Passwords do not match'
    }
    
    // Partial password validation
    if (!formData.partialPassword) {
      newErrors.partialPassword = 'Partial password is required'
    } else if (formData.partialPassword.length < 6) {
      newErrors.partialPassword = 'Password must be at least 6 characters'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/.test(formData.partialPassword)) {
      newErrors.partialPassword = 'Password must contain uppercase, lowercase, and number'
    }
    
    if (formData.partialPassword !== formData.confirmPartialPassword) {
      newErrors.confirmPartialPassword = 'Passwords do not match'
    }
    
    // Check if passwords are the same
    if (formData.fullPassword && formData.partialPassword && formData.fullPassword === formData.partialPassword) {
      newErrors.partialPassword = 'Partial password must be different from full password'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      await onComplete({
        fullPassword: formData.fullPassword,
        partialPassword: formData.partialPassword,
        biometricEnabled: formData.biometricEnabled,
        backgroundPermissions: formData.backgroundPermissions,
        voiceLanguage: formData.voiceLanguage
      })
    } catch (error) {
      console.error('Error setting up SOS passwords:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {existingProfile ? 'Update' : 'Setup'} SOS Passwords
          </h1>
          <p className="text-gray-600">
            Create secure passwords for emergency situations. These will help authorities verify your safety.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Password Section */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Full Deactivation Password</h3>
                <p className="text-sm text-gray-600">Stops the alarm completely</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.full ? 'text' : 'password'}
                    value={formData.fullPassword}
                    onChange={(e) => handleInputChange('fullPassword', e.target.value)}
                    className={`input pr-12 ${errors.fullPassword ? 'border-red-300' : ''}`}
                    placeholder="Enter full password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('full')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.full ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.fullPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.fullPassword}</p>
                )}
                {formData.fullPassword && (
                  <div className="mt-2">
                    <div className={`text-sm ${passwordStrength.full.color}`}>
                      Strength: {passwordStrength.full.level}
                    </div>
                    <div className="text-xs text-gray-600">{passwordStrength.full.feedback}</div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Full Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.fullConfirm ? 'text' : 'password'}
                    value={formData.confirmFullPassword}
                    onChange={(e) => handleInputChange('confirmFullPassword', e.target.value)}
                    className={`input pr-12 ${errors.confirmFullPassword ? 'border-red-300' : ''}`}
                    placeholder="Confirm full password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('fullConfirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.fullConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmFullPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmFullPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Partial Password Section */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Stealth Mode Password</h3>
                <p className="text-sm text-gray-600">Silences alarm but continues monitoring</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partial Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.partial ? 'text' : 'password'}
                    value={formData.partialPassword}
                    onChange={(e) => handleInputChange('partialPassword', e.target.value)}
                    className={`input pr-12 ${errors.partialPassword ? 'border-red-300' : ''}`}
                    placeholder="Enter partial password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('partial')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.partial ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.partialPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.partialPassword}</p>
                )}
                {formData.partialPassword && (
                  <div className="mt-2">
                    <div className={`text-sm ${passwordStrength.partial.color}`}>
                      Strength: {passwordStrength.partial.level}
                    </div>
                    <div className="text-xs text-gray-600">{passwordStrength.partial.feedback}</div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Partial Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.partialConfirm ? 'text' : 'password'}
                    value={formData.confirmPartialPassword}
                    onChange={(e) => handleInputChange('confirmPartialPassword', e.target.value)}
                    className={`input pr-12 ${errors.confirmPartialPassword ? 'border-red-300' : ''}`}
                    placeholder="Confirm partial password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('partialConfirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.partialConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPartialPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPartialPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Additional Settings</h3>
                <p className="text-sm text-gray-600">Configure security options</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Voice Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Alert Language
                </label>
                <select
                  value={formData.voiceLanguage}
                  onChange={(e) => handleInputChange('voiceLanguage', e.target.value)}
                  className="input"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ml">Malayalam</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="kn">Kannada</option>
                </select>
              </div>
              
              {/* Biometric Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Biometric Authentication</h4>
                  <p className="text-sm text-gray-600">Use fingerprint/face ID as backup</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('biometricEnabled', !formData.biometricEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.biometricEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Background Permissions */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Background Monitoring</h4>
                  <p className="text-sm text-gray-600">Allow app to run in background</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('backgroundPermissions', !formData.backgroundPermissions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.backgroundPermissions ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.backgroundPermissions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="card border-l-4 border-amber-500 bg-amber-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Important Security Note</h4>
                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                  <li>• Remember these passwords - they cannot be recovered</li>
                  <li>• Full password completely stops all alerts</li>
                  <li>• Partial password enables stealth mode</li>
                  <li>• Practice using them in a safe environment</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary py-3 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={20} />
                  <span>{existingProfile ? 'Update' : 'Setup'} SOS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SOSPasswordSetup