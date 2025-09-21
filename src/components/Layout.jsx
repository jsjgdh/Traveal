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
                       location.pathname.startsWith('/sos') ||
                       location.pathname.startsWith('/trip-planner') ||
                       location.pathname.startsWith('/discover')

  const showHeader = !location.pathname.startsWith('/dashboard') && 
                     !location.pathname.startsWith('/trip-planner')

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className={`flex-1 ${showHeader ? '' : 'pt-0'} ${showBottomNav ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  )
}

export default Layout