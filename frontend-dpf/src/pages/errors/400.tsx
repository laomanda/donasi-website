import { useSearchParams } from 'react-router-dom'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error400 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={400}
      title="Permintaan tidak valid"
      description="Server tidak dapat memproses permintaan ini."
      suggestion="Periksa kembali data yang Anda kirim."
      message={params.get('message')}
      icon={faTriangleExclamation}
      tone="primary"
    />
  )
}

export default Error400
