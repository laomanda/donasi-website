import { useSearchParams } from 'react-router-dom'
import { faServer } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error408 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={408}
      title="Batas waktu permintaan"
      description="Server membutuhkan waktu lebih lama untuk memproses permintaan Anda."
      suggestion="Periksa koneksi internet lalu coba ulang."
      message={params.get('message')}
      icon={faServer}
      tone="danger"
    />
  )
}

export default Error408
