import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import { resolveStorageUrl } from "@/lib/urls";

type Props = {
  images: { image: string }[];
  title: string;
};

export default function MitraProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);

  const urls = images.map(
    (item) => resolveStorageUrl(item.image, imagePlaceholder) ?? imagePlaceholder
  );
  const currentImage = urls[active] ?? imagePlaceholder;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/80 shadow-soft">
      {/* Main Image Viewport */}
      <div className="relative flex min-h-[360px] max-h-[540px] w-full items-center justify-center p-4 sm:p-6">
        {/* Blurred background preview for poster/portrait aspect fill */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 blur-xl transition-all duration-500"
          style={{ backgroundImage: `url(${currentImage})` }}
        />

        <img
          src={currentImage}
          alt={title}
          className="relative z-10 max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-sm"
          onError={(event) => {
            event.currentTarget.src = imagePlaceholder;
          }}
        />

        {/* Carousel Navigation Buttons */}
        {urls.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous Image"
              onClick={() => setActive((index) => (index - 1 + urls.length) % urls.length)}
              className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
            </button>
            <button
              type="button"
              aria-label="Next Image"
              onClick={() => setActive((index) => (index + 1) % urls.length)}
              className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
            >
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Indicators */}
      {urls.length > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-white p-4">
          {urls.map((url, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Gambar ${index + 1}`}
              onClick={() => setActive(index)}
              className={`relative h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${
                index === active
                  ? "border-brandGreen-600 scale-105 shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
