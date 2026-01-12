import axios from 'axios'
import { clearAuthToken, clearAuthUser, getAuthToken } from './auth'
import { resolveApiBaseUrl, resolveBackendBaseUrl } from './urls'

const API_BASE_URL = resolveApiBaseUrl()
const BACKEND_BASE_URL = resolveBackendBaseUrl()

let csrfFetched = false
const fetchCsrfCookie = async () => {
  if (csrfFetched) return
  await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })
  csrfFetched = true
}

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

http.interceptors.request.use(async (config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }

  const method = (config.method ?? 'get').toLowerCase()
  // Ambil CSRF cookie sebelum request stateful non-GET
  if (method !== 'get' && !csrfFetched && !config.url?.includes('csrf-cookie')) {
    await fetchCsrfCookie()
  }
  return config
})

const allowedErrorCodes = new Set([
  400, 401, 402, 403, 404, 405, 408, 409, 429, 500, 503,
])

const redirectToErrorPage = (status: number, message?: string) => {
  if (status < 400 || status >= 600) return

  const finalCode = allowedErrorCodes.has(status) ? status : 500

  const params = new URLSearchParams()
  if (message) {
    params.set('message', message)
  }

  const query = params.toString()
  window.location.href = `/error/${finalCode}${query ? `?${query}` : ''}`
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.response) {
      // network error -> biarkan komponen handle fallback
      return Promise.reject(error)
    }

    const status = error.response.status
    if (status === 401) {
      clearAuthToken()
      clearAuthUser()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    const message =
      error.response.data?.message ??
      error.message ??
      'Terjadi kesalahan yang tidak diketahui.'

    const url = String(error.config?.url ?? '')
    const shouldSkipRedirect =
      status === 422 || status === 429 || url.includes('/auth/login')

    if (!shouldSkipRedirect) {
      redirectToErrorPage(status, message)
    }
    return Promise.reject(error)
  }
)

export { redirectToErrorPage }
export default http
