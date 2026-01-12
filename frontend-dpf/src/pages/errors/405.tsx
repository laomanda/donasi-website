import { useSearchParams } from 'react-router-dom'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error405 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={405}
      title="Metode tidak diizinkan"
      description="Metode HTTP yang digunakan tidak didukung."
      suggestion="Gunakan metode yang benar atau hubungi admin."
      message={params.get('message')}
      icon={faTriangleExclamation}
      tone="primary"
    />
  )
}

export default Error405
