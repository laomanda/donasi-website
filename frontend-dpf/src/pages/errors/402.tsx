import { useSearchParams } from 'react-router-dom'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import ErrorLayout from './ErrorLayout'

const Error402 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={402}
      title="Pembayaran diperlukan"
      description="Sesi ini membutuhkan otorisasi pembayaran."
      suggestion="Pastikan metode pembayaran tersedia atau hubungi admin."
      message={params.get('message')}
      icon={faCreditCard}
      tone="primary"
    />
  )
}

export default Error402
