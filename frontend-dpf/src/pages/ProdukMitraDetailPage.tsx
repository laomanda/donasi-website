import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { LandingLayout } from "@/layouts/LandingLayout";
import { useLang } from "@/lib/i18n";
import { translate } from "@/lib/i18n-utils";
import http from "@/lib/http";
import { resolveApiBaseUrl } from "@/lib/urls";
import { dpfIcon } from "@/assets/brand";
import MitraProductGallery from "@/components/mitra-products/MitraProductGallery";
import { mitraProductDict } from "@/components/mitra-products/MitraProductI18n";

type Product = {
  slug: string;
  nama_mitra?: string | null;
  title_id: string;
  title_en: string;
  description_id: string;
  description_en: string;
  images: { image: string; sort_order: number }[];
};

type Response = { product: Product };

export default function ProdukMitraDetailPage() {
  const { slug } = useParams();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) =>
    translate(mitraProductDict, locale, key, fallback);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    http
      .get<Response>(`/mitra-products/${slug}`)
      .then((response) => active && setProduct(response.data.product))
      .catch(() => active && setError(t("product.detailError")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, locale]);

  if (loading) {
    return (
      <LandingLayout>
        <main className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-6 w-36 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="min-h-[400px] animate-pulse rounded-3xl bg-slate-200 lg:col-span-7" />
              <div className="min-h-[300px] animate-pulse rounded-3xl bg-slate-200 lg:col-span-5" />
            </div>
          </div>
        </main>
      </LandingLayout>
    );
  }

  if (!product || error) {
    return (
      <LandingLayout>
        <main className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/produk-mitra"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brandGreen-700"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>{t("product.back")}</span>
            </Link>
            <p className="mt-6 rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700">
              {error || t("product.detailError")}
            </p>
          </div>
        </main>
      </LandingLayout>
    );
  }

  const isEn = locale === "en";
  const title = isEn
    ? product.title_en || product.title_id
    : product.title_id || product.title_en;
  const description = isEn
    ? product.description_en || product.description_id
    : product.description_id || product.description_en;

  const sortedImages = [...product.images].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <LandingLayout>
      <main className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <Link
            to="/produk-mitra"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors duration-200 hover:text-brandGreen-700"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>{t("product.back")}</span>
          </Link>

          {/* Main Showcase Layout (7:5 ratio for comfortable balance) */}
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-start">
            {/* Gallery Column (7 columns) */}
            <div className="lg:col-span-7">
              <MitraProductGallery images={sortedImages} title={title} />
            </div>

            {/* Information Column (5 columns - Normal Flow) */}
            <div className="lg:col-span-5 min-w-0">
              <div className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft overflow-hidden">
                {/* Eyebrow: Nama Mitra & DPF Verified Badge */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-brandGreen-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brandGreen-700 ring-1 ring-brandGreen-100">
                    {product.nama_mitra?.trim() || t("product.defaultPartner", "Mitra Wakaf DPF")}
                  </span>

                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1 ring-1 ring-slate-200/80">
                    <img src={dpfIcon} alt="DPF" className="h-4 w-auto object-contain shrink-0" />
                    <span className="text-xs font-bold text-slate-900">Djalaludin Pane Foundation</span>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-xs shrink-0" />
                  </div>
                </div>

                {/* Judul Produk */}
                <div className="mt-1">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold leading-tight text-slate-900 break-words">
                    {title}
                  </h1>
                </div>

                {/* Deskripsi Produk */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    {isEn ? "Description" : "Deskripsi Produk"}
                  </h2>
                  <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-600 whitespace-pre-line break-words [word-break:break-word] overflow-hidden">
                    {description}
                  </div>
                </div>

                {/* WhatsApp Contact CTA */}
                <div className="mt-8 border-t border-slate-100 pt-6 flex justify-start">
                  <a
                    href={`${resolveApiBaseUrl()}/mitra-products/${product.slug}/contact`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-95"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                    <span>{t("product.contact")}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </LandingLayout>
  );
}
