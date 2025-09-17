import { useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNavigation from './BottomNavigation'

function Layout({ children }) {
  const location = useLocation()
  const showBottomNav = location.pathname.startsWith('/dashboard') || 
                       location.pathname.startsWith('/trip') ||
                       location.pathname.startsWith('/data') || 
                       location.pathname.startsWith('/rewards') || 
                       location.pathname.startsWith('/profile') || 
                       location.pathname.startsWith('/settings') ||
                       location.pathname.startsWith('/sos')

  const showHeader = !showBottomNav // Hide header on dashboard pages since they have their own

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className={showHeader ? "flex-1" : "flex-1"}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  )
}

export default Layout