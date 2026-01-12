import { Outlet } from 'react-router-dom'
import { ToastProvider } from './components/ui/ToastProvider'

const App = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-white text-slate-900 antialiased">
        <Outlet />
      </div>
    </ToastProvider>
  )
}

export default App
