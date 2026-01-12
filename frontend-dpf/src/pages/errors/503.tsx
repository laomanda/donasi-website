import { useSearchParams } from 'react-router-dom'
import { faServer } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error503 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={503}
      title="Sedang pemeliharaan"
      description="Layanan sedang dalam perawatan sementara."
      suggestion="Kembali beberapa saat lagi."
      message={params.get('message')}
      icon={faServer}
      tone="danger"
    />
  )
}

export default Error503
