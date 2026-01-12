import { useSearchParams } from 'react-router-dom'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error429 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={429}
      title="Terlalu banyak permintaan"
      description="Anda mengirim terlalu banyak permintaan dalam waktu singkat."
      suggestion="Tunggu beberapa saat sebelum mencoba lagi."
      message={params.get('message')}
      icon={faTriangleExclamation}
      tone="primary"
    />
  )
}

export default Error429
