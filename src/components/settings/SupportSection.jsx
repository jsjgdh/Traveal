import { useState } from 'react'
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Mail,
  Phone,
  ExternalLink,
  FileText,
  Bug,
  Star,
  Info
} from 'lucide-react'

function SupportSection({ onBack }) {
  const [activeView, setActiveView] = useState('main') // 'main', 'help', 'contact', 'about'

  if (activeView === 'help') {
    return <HelpCenter onBack={() => setActiveView('main')} />
  }

  if (activeView === 'contact') {
    return <ContactUs onBack={() => setActiveView('main')} />
  }

  if (activeView === 'about') {
    return <AboutApp onBack={() => setActiveView('main')} />
  }

  const supportOptions = [
    {
      id: 'help',
      title: 'Help Center',
      description: 'FAQ and user guides',
      icon: HelpCircle,
      color: 'bg-blue-500'
    },
    {
      id: 'contact',
      title: 'Contact Us',
      description: 'Get in touch with support',
      icon: MessageCircle,
      color: 'bg-green-500'
    },
    {
      id: 'about',
      title: 'About Travel',
      description: 'App info and version details',
      icon: Info,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Support</h2>
          <p className="text-sm text-gray-600">Get help and information</p>
        </div>
      </div>

      {/* Support Options */}
      <div className="space-y-3">
        {supportOptions.map((option) => {
          const IconComponent = option.icon
          return (
            <button
              key={option.id}
              onClick={() => setActiveView(option.id)}
              className="w-full card hover:shadow-lg transition-all duration-200 flex items-center space-x-4 p-4"
            >
              <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center`}>
                <IconComponent size={20} className="text-white" />
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              
              <ExternalLink size={16} className="text-gray-400" />
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Quick Support</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <Bug size={16} className="text-red-500" />
            <span className="text-sm text-gray-900">Report a Bug</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm text-gray-900">Rate the App</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function HelpCenter({ onBack }) {
  const faqItems = [
    {
      question: 'How does automatic trip detection work?',
      answer: 'The app uses your device\'s GPS and motion sensors to detect when you start and stop traveling. It automatically identifies different transportation modes like walking, cycling, driving, or using public transport.'
    },
    {
      question: 'Is my location data safe and private?',
      answer: 'Yes, your privacy is our top priority. Location data is processed locally on your device, and only anonymized, aggregated patterns are shared with research partners. Your exact routes and personal information are never disclosed.'
    },
    {
      question: 'How can I export my travel data?',
      answer: 'Go to Settings > Data & Privacy > Export Data. You can download all your trip data in JSON format for your personal records.'
    },
    {
      question: 'Why does the app use my battery?',
      answer: 'Location tracking requires some battery usage. You can adjust this in Settings > App Preferences > Battery Optimization to balance accuracy with battery life.'
    },
    {
      question: 'Can I manually add trips?',
      answer: 'Yes! If automatic detection misses a trip, you can manually add it using the "Add Trip" button on the main screen.'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Help Center</h2>
          <p className="text-sm text-gray-600">Frequently asked questions</p>
        </div>
      </div>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>

      <div className="card bg-green-50 border-green-200">
        <div className="flex items-start space-x-3">
          <HelpCircle size={20} className="text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">Need More Help?</h4>
            <p className="text-sm text-green-700 mt-1">
              Can't find what you're looking for? Contact our support team for personalized assistance.
            </p>
            <button className="text-sm text-green-600 hover:text-green-700 mt-2 underline">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactUs({ onBack }) {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const contactMethods = [
    {
      type: 'Email',
      value: 'support@natpac.kerala.gov.in',
      icon: Mail,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      type: 'Phone',
      value: '+91 471 2471913',
      icon: Phone,
      color: 'text-green-600 bg-green-100'
    }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log('Contact form submitted:', contactForm)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
          <p className="text-sm text-gray-600">Get in touch with our team</p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="space-y-3">
        {contactMethods.map((method) => {
          const IconComponent = method.icon
          return (
            <div key={method.type} className="card flex items-center space-x-3 p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method.color}`}>
                <IconComponent size={18} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{method.type}</h4>
                <p className="text-sm text-gray-600">{method.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Contact Form */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Send us a message</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={contactForm.subject}
              onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select a subject</option>
              <option value="technical">Technical Issue</option>
              <option value="privacy">Privacy Concern</option>
              <option value="feature">Feature Request</option>
              <option value="general">General Inquiry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <button type="submit" className="w-full btn-primary">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}

function AboutApp({ onBack }) {
  const appInfo = {
    version: '1.0.0',
    buildNumber: '2024.01.15',
    developer: 'NATPAC',
    organization: 'Government of Kerala'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">About Travel</h2>
          <p className="text-sm text-gray-600">App information and details</p>
        </div>
      </div>

      {/* App Logo and Info */}
      <div className="card text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Travel Data Collection</h3>
        <p className="text-gray-600 mb-4">
          Contributing to Kerala's transportation research and infrastructure development
        </p>
        <div className="text-sm text-gray-500">
          Version {appInfo.version} • Build {appInfo.buildNumber}
        </div>
      </div>

      {/* App Details */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-3">App Information</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Developer</span>
            <span className="text-gray-900">{appInfo.developer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Organization</span>
            <span className="text-gray-900">{appInfo.organization}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Version</span>
            <span className="text-gray-900">{appInfo.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Build</span>
            <span className="text-gray-900">{appInfo.buildNumber}</span>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-2">Our Mission</h4>
        <p className="text-sm text-primary-700">
          To improve Kerala's transportation infrastructure through data-driven insights. 
          Your anonymous travel patterns help us understand mobility needs and plan better 
          transportation solutions for everyone.
        </p>
      </div>

      {/* Legal Links */}
      <div className="space-y-2">
        <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700 underline">
          Privacy Policy
        </button>
        <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700 underline">
          Terms of Service
        </button>
        <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700 underline">
          Data Usage Policy
        </button>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between p-4"
      >
        <h4 className="font-medium text-gray-900">{question}</h4>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default SupportSection