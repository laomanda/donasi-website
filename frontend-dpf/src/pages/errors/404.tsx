import { useSearchParams } from 'react-router-dom'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error404 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={404}
      title="Halaman tidak ditemukan"
      description="URL yang Anda tuju tidak tersedia atau telah dipindahkan."
      suggestion="Coba kembali ke beranda atau gunakan menu navigasi."
      message={params.get('message')}
      icon={faTriangleExclamation}
      tone="primary"
    />
  )
}

export default Error404
