import { useState } from 'react'
import { 
  AlertTriangle, 
  Trash2, 
  Download, 
  Shield, 
  Lock,
  ArrowLeft,
  Check,
  X,
  Eye,
  EyeOff,
  Calendar,
  FileText,
  Database,
  Clock,
  Mail
} from 'lucide-react'

function AccountDeletionFlow({ onBack }) {
  const [step, setStep] = useState(1) // 1: warning, 2: data export, 3: confirmation, 4: final verification
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [exportData, setExportData] = useState(true)
  const [reasonForDeletion, setReasonForDeletion] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState({})

  const deletionReasons = [
    'No longer need the service',
    'Privacy concerns',
    'Found a better alternative',
    'Too many notifications',
    'Technical issues',
    'Other (please specify below)'
  ]

  const handlePasswordValidation = () => {
    if (!password) {
      setErrors({ password: 'Password is required to delete account' })
      return false
    }
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      setErrors({ confirmation: 'Please type "DELETE MY ACCOUNT" exactly as shown' })
      return false
    }
    setErrors({})
    return true
  }

  const handleAccountDeletion = () => {
    if (handlePasswordValidation()) {
      setIsDeleting(true)
      // Simulate API call
      setTimeout(() => {
        setIsDeleting(false)
        alert('Account deletion request submitted. You will receive a confirmation email.')
        onBack()
      }, 3000)
    }
  }

  const renderWarningStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={40} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Your Account</h2>
        <p className="text-gray-600">
          This action cannot be undone. Please review what happens when you delete your account.
        </p>
      </div>

      <div className="card bg-red-50 border-red-200">
        <h3 className="font-semibold text-red-900 mb-3">What will be deleted:</h3>
        <ul className="space-y-2 text-sm text-red-700">
          <li className="flex items-center space-x-2">
            <X size={16} className="text-red-600" />
            <span>All your travel data and trip history</span>
          </li>
          <li className="flex items-center space-x-2">
            <X size={16} className="text-red-600" />
            <span>Your profile information and preferences</span>
          </li>
          <li className="flex items-center space-x-2">
            <X size={16} className="text-red-600" />
            <span>Achievement badges and progress</span>
          </li>
          <li className="flex items-center space-x-2">
            <X size={16} className="text-red-600" />
            <span>All associated data and analytics</span>
          </li>
          <li className="flex items-center space-x-2">
            <X size={16} className="text-red-600" />
            <span>Access to the Traveal platform</span>
          </li>
        </ul>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Before you go:</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-center space-x-2">
            <Check size={16} className="text-blue-600" />
            <span>Export your data if you want to keep a copy</span>
          </li>
          <li className="flex items-center space-x-2">
            <Check size={16} className="text-blue-600" />
            <span>Your contribution to transportation research will remain (anonymized)</span>
          </li>
          <li className="flex items-center space-x-2">
            <Check size={16} className="text-blue-600" />
            <span>You can create a new account anytime in the future</span>
          </li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 btn-secondary"
        >
          Keep My Account
        </button>
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Continue Deletion
        </button>
      </div>
    </div>
  )

  const renderDataExportStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download size={32} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Export Your Data</h2>
        <p className="text-gray-600">
          Download a copy of your data before account deletion
        </p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Export Data Before Deletion</h3>
            <p className="text-sm text-gray-600">Recommended to keep a personal copy</p>
          </div>
          <button
            onClick={() => setExportData(!exportData)}
            className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
              exportData ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
              exportData ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {exportData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Your export will include:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Trip history and travel patterns</li>
              <li>• Profile information and preferences</li>
              <li>• Achievement and milestone data</li>
              <li>• Account settings and configurations</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Export will be available for download within 24 hours via email
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Help us improve (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Why are you deleting your account? Your feedback helps us improve.
        </p>
        <div className="space-y-2">
          {deletionReasons.map((reason) => (
            <label key={reason} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={reasonForDeletion === reason}
                onChange={(e) => setReasonForDeletion(e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{reason}</span>
            </label>
          ))}
        </div>
        {reasonForDeletion === 'Other (please specify below)' && (
          <textarea
            className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows="3"
            placeholder="Please tell us more..."
          />
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 btn-secondary"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Continue to Confirmation
        </button>
      </div>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Final Confirmation</h2>
        <p className="text-gray-600">
          Please confirm you understand the consequences of account deletion
        </p>
      </div>

      <div className="card bg-orange-50 border-orange-200">
        <h3 className="font-semibold text-orange-900 mb-3">Important Reminders:</h3>
        <ul className="space-y-2 text-sm text-orange-700">
          <li>• This action is permanent and cannot be undone</li>
          <li>• All your data will be permanently deleted within 30 days</li>
          <li>• Any ongoing data exports will be cancelled</li>
          <li>• You will lose access immediately after confirmation</li>
          {exportData && <li>• Your data export will be emailed within 24 hours</li>}
        </ul>
      </div>

      <div className="card">
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 text-red-600 focus:ring-red-500 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I understand that deleting my account is permanent and cannot be undone. 
              I acknowledge that all my data will be permanently deleted and I will lose 
              access to all features and services.
            </span>
          </label>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 btn-secondary"
        >
          Back
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!agreedToTerms}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Proceed to Final Step
        </button>
      </div>
    </div>
  )

  const renderFinalVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Identity</h2>
        <p className="text-gray-600">
          Enter your password and confirmation text to complete account deletion
        </p>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "DELETE MY ACCOUNT" to confirm *
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.confirmation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="DELETE MY ACCOUNT"
            />
            {errors.confirmation && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmation}</p>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-red-50 border-red-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900">Final Warning</h4>
            <p className="text-sm text-red-700 mt-1">
              Once you click "Delete My Account", your account will be permanently deleted. 
              This action cannot be reversed. Are you absolutely sure you want to proceed?
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(3)}
          className="flex-1 btn-secondary"
        >
          Back
        </button>
        <button
          onClick={handleAccountDeletion}
          disabled={isDeleting || !password || confirmationText !== 'DELETE MY ACCOUNT'}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Trash2 size={16} />
          )}
          <span>{isDeleting ? 'Deleting Account...' : 'Delete My Account'}</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button 
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Account Deletion</h2>
          <p className="text-sm text-gray-600">Step {step} of 4</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-red-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {step === 1 && renderWarningStep()}
      {step === 2 && renderDataExportStep()}
      {step === 3 && renderConfirmationStep()}
      {step === 4 && renderFinalVerificationStep()}
    </div>
  )
}

export default AccountDeletionFlow