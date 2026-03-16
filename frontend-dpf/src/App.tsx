import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/ui/ToastProvider'
import http from './lib/http'
import { BackgroundMusic } from './components/landing/BackgroundMusic'
import { ScrollToTop } from './components/ui/ScrollToTop'

const App = () => {
  const location = useLocation();

  const isDashboard = 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/editor') ||
    location.pathname.startsWith('/mitra') ||
    location.pathname.startsWith('/superadmin') ||
    location.pathname.startsWith('/management');


  // Global cleanup: if there's a pending donation in sessionStorage but user
  // navigated away from /donate without completing payment → cancel immediately.
  useEffect(() => {
    const pendingId    = sessionStorage.getItem('dpf_pending_donation_id');
    const pendingOrder = sessionStorage.getItem('dpf_pending_order_id');
    const isOnDonatePage = location.pathname.startsWith('/donate');

    if (pendingId && !isOnDonatePage) {
      sessionStorage.removeItem('dpf_pending_donation_id');
      sessionStorage.removeItem('dpf_pending_order_id');
      if (pendingOrder) {
        // Use check-by-order — most reliable way to set status=failed without auth
        http.post(`/donations/check-by-order`, {
          order_id: pendingOrder,
          snap_result: { transaction_status: 'cancel' }
        }).catch(() => {});
      }
    }
  }, [location.pathname]);

  return (
    <ToastProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-white text-slate-900 antialiased">
        <Outlet />
        {!isDashboard && <BackgroundMusic />}
      </div>
    </ToastProvider>
  )
}

export default App
