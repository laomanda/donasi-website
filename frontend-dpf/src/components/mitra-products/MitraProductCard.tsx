import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faStore, faBoxOpen, faFileLines, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import { resolveStorageUrl } from "@/lib/urls";
import { dpfIcon } from "@/assets/brand";

export type MitraProductItem = {
  id: number;
  slug: string;
  nama_mitra?: string | null;
  title_id: string;
  title_en: string;
  description_id?: string | null;
  description_en?: string | null;
  images?: { image: string }[];
};

interface MitraProductCardProps {
  product: MitraProductItem;
  locale: "id" | "en";
}

export function MitraProductCard({ product, locale }: MitraProductCardProps) {
  const isEn = locale === "en";
  const title = isEn
    ? product.title_en || product.title_id
    : product.title_id || product.title_en;
  const description = isEn
    ? product.description_en || product.description_id
    : product.description_id || product.description_en;

  const rawImage = product.images?.[0]?.image;
  const coverUrl = resolveStorageUrl(rawImage, imagePlaceholder) ?? imagePlaceholder;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft transition-colors duration-200 hover:border-slate-200">
      <Link to={`/produk-mitra/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={coverUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== imagePlaceholder) {
                target.src = imagePlaceholder;
              }
            }}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {/* Eyebrow: Nama Mitra / Fallback Mitra Wakaf DPF (dengan icon faStore) */}
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-brandGreen-700">
          <FontAwesomeIcon icon={faStore} className="text-[10px]" />
          <span>{product.nama_mitra?.trim() || (isEn ? "DPF Waqf Partner" : "Mitra Wakaf DPF")}</span>
        </p>

        {/* Judul Produk (dengan icon faBoxOpen) */}
        <div className="mt-1.5 flex items-start gap-2 min-h-[3.25rem]">
          <FontAwesomeIcon icon={faBoxOpen} className="mt-1 text-primary-600 text-sm shrink-0" />
          <h2 className="font-heading text-lg font-bold leading-snug text-slate-900 line-clamp-2">
            <Link to={`/produk-mitra/${product.slug}`}>
              {title}
            </Link>
          </h2>
        </div>

        {/* Deskripsi Ringkas (dengan icon faFileLines) */}
        <div className="mt-2 flex items-start gap-2 min-h-[2.75rem]">
          <FontAwesomeIcon icon={faFileLines} className="mt-1 text-slate-400 text-xs shrink-0" />
          <p className="text-sm leading-relaxed text-slate-600 line-clamp-2">
            {description || "\u00A0"}
          </p>
        </div>

        {/* Verified Foundation Curator Identity (dpf-icon.webp + Djalaluddin Pane Foundation + blue check) */}
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-slate-100/80">
            <img src={dpfIcon} alt="DPF" className="h-5 w-auto object-contain shrink-0" />
            <span className="text-xs font-bold text-slate-900 truncate">Djalaluddin Pane Foundation</span>
            <FontAwesomeIcon icon={faCheckCircle} className="ml-auto text-blue-500 text-xs shrink-0" />
          </div>
        </div>

        {/* Footer & CTA */}
        <div className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-end">
          <Link
            to={`/produk-mitra/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 transition-colors duration-200 group-hover:text-primary-600"
          >
            <span>{isEn ? "View details" : "Lihat Produk"}</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}
