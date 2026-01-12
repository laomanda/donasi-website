import { useSearchParams } from 'react-router-dom'
import { faServer } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error500 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={500}
      title="Kesalahan server"
      description="Terjadi kendala internal pada server."
      suggestion="Silakan coba beberapa saat lagi."
      message={params.get('message')}
      icon={faServer}
      tone="danger"
    />
  )
}

export default Error500
