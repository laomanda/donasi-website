import { useSearchParams } from 'react-router-dom'
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error403 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={403}
      title="Tidak memiliki akses"
      description="Anda tidak memiliki izin untuk membuka halaman tersebut."
      suggestion="Gunakan akun dengan peran yang sesuai atau hubungi admin."
      message={params.get('message')}
      icon={faShieldHalved}
      tone="green"
    />
  )
}

export default Error403
