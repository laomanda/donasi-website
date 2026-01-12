import { useSearchParams } from 'react-router-dom'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error409 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={409}
      title="Terjadi konflik data"
      description="Permintaan ini bertabrakan dengan kondisi data saat ini."
      suggestion="Muat ulang data Anda atau hubungi tim bantuan."
      message={params.get('message')}
      icon={faTriangleExclamation}
      tone="primary"
    />
  )
}

export default Error409
