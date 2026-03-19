import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import './lib/http'
import { LangProvider } from './lib/i18n'
import { MusicProvider } from './lib/MusicContext'
import { SavedItemsProvider } from './lib/SavedItemsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <MusicProvider>
        <SavedItemsProvider>
          <RouterProvider router={router} />
        </SavedItemsProvider>
      </MusicProvider>
    </LangProvider>
  </StrictMode>,
)
