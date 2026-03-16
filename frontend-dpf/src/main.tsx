import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import './lib/http'
import { LangProvider } from './lib/i18n'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { MusicProvider } from './lib/MusicContext'
import { SavedItemsProvider } from './lib/SavedItemsContext'
import { resolveGoogleClientId } from './lib/urls'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <GoogleOAuthProvider clientId={resolveGoogleClientId()}>
        <MusicProvider>
          <SavedItemsProvider>
            <RouterProvider router={router} />
          </SavedItemsProvider>
        </MusicProvider>
      </GoogleOAuthProvider>
    </LangProvider>
  </StrictMode>,
)
