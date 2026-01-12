import { useSearchParams } from 'react-router-dom'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error401 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={401}
      title="Tidak terautentikasi"
      description="Anda perlu masuk terlebih dahulu sebelum mengakses halaman ini."
      suggestion="Silakan masuk kembali, lalu coba ulang."
      message={params.get('message')}
      icon={faLock}
      tone="primary"
    />
  )
}

export default Error401
