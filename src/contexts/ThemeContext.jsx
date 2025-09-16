import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [isSystemTheme, setIsSystemTheme] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('traveal_theme')
    const savedSystemPreference = localStorage.getItem('traveal_system_theme')
    
    if (savedTheme) {
      setTheme(savedTheme)
      setIsSystemTheme(savedSystemPreference === 'true')
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
      setIsSystemTheme(true)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff')
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystemTheme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isSystemTheme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setIsSystemTheme(false)
    localStorage.setItem('traveal_theme', newTheme)
    localStorage.setItem('traveal_system_theme', 'false')
  }

  const setSystemTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
    setIsSystemTheme(true)
    localStorage.setItem('traveal_system_theme', 'true')
    localStorage.removeItem('traveal_theme')
  }

  const setLightTheme = () => {
    setTheme('light')
    setIsSystemTheme(false)
    localStorage.setItem('traveal_theme', 'light')
    localStorage.setItem('traveal_system_theme', 'false')
  }

  const setDarkTheme = () => {
    setTheme('dark')
    setIsSystemTheme(false)
    localStorage.setItem('traveal_theme', 'dark')
    localStorage.setItem('traveal_system_theme', 'false')
  }

  const value = {
    theme,
    isSystemTheme,
    toggleTheme,
    setSystemTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext