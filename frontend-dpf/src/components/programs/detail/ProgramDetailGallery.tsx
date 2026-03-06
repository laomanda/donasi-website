import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faArrowRight 
} from "@fortawesome/free-solid-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";

interface ProgramDetailGalleryProps {
  galleryUrls: string[];
  activeImageIndex: number;
  setActiveImageIndex: (index: number | ((prev: number) => number)) => void;
  programTitle: string;
}

export function ProgramDetailGallery({ 
  galleryUrls, 
  activeImageIndex, 
  setActiveImageIndex,
  programTitle 
}: ProgramDetailGalleryProps) {
  const heroImage = galleryUrls[activeImageIndex] ?? imagePlaceholder;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-slate-100 shadow-soft">
      <div className="relative aspect-[16/9]">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl transition-opacity duration-500"
          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
        />
        <div className="relative z-10 h-full w-full overflow-hidden">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
          >
            {galleryUrls.map((url, idx) => (
              <img
                key={url + idx}
                src={url}
                alt={programTitle}
                className="h-full w-full shrink-0 object-contain"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
            ))}
          </div>
        </div>

        {galleryUrls.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveImageIndex((prev) => (prev - 1 + galleryUrls.length) % galleryUrls.length)
              }
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
              aria-label="Foto sebelumnya"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              type="button"
              onClick={() => setActiveImageIndex((prev: number) => (prev + 1) % galleryUrls.length)}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
              aria-label="Foto berikutnya"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </>
        ) : null}
      </div>

      {galleryUrls.length > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-white/90 px-4 py-3">
          {galleryUrls.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={[
                "h-2.5 w-2.5 rounded-full transition",
                idx === activeImageIndex ? "bg-brandGreen-600" : "bg-slate-300",
              ].join(" ")}
              aria-label={`Pilih foto ${idx + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
