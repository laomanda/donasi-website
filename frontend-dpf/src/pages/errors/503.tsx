import { useSearchParams } from 'react-router-dom'
import { faWrench, faComments } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ErrorLayout from './ErrorLayout'

const Error503 = () => {
  const [params] = useSearchParams()
  return (
    <ErrorLayout
      code={503}
      title="Sistem Sedang Ditingkatkan"
      description="Layanan website DPF sedang dalam pemeliharaan rutin untuk meningkatkan performa dan keamanan donasi Anda."
      suggestion="Kami akan segera kembali. Untuk donasi darurat / pertanyaan, silakan hubungi tim kami."
      message={params.get('message')}
      icon={faWrench}
      tone="green"
      extraActions={
        <a
          href="https://wa.me/6281311768254?text=Halo%20Admin%20DPF,%20saya%20ingin%20berdonasi%20/%20konfirmasi%20program%20wakaf."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95"
        >
          <FontAwesomeIcon icon={faComments} className="mr-2 text-xs" />
          WhatsApp Admin
        </a>
      }
    />
  )
}

export default Error503

