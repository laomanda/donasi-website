import { imagePlaceholder } from "@/lib/placeholder";
import { resolveStorageUrl } from "@/lib/urls";
import type { Locale } from "@/lib/i18n";

type GalleryItem = {
    id: number;
    image: string;
    caption_id: string;
    caption_en: string;
};

type Props = {
    items: GalleryItem[];
    locale: Locale;
    emptyLabel: string;
};

const pickCaption = (item: GalleryItem, locale: Locale) =>
    locale === "en"
        ? item.caption_en || item.caption_id
        : item.caption_id || item.caption_en;

export default function GalleryMitraGrid({ items, locale, emptyLabel }: Props) {
    if (!items.length) {
        return (
            <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm font-semibold text-slate-500">
                {emptyLabel}
            </div>
        );
    }

    return (
        <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 space-y-4">
            {items.map((item) => {
                const caption = pickCaption(item, locale);
                const imageUrl =
                    resolveStorageUrl(item.image, imagePlaceholder) ??
                    imagePlaceholder;
                return (
                    <figure
                        key={item.id}
                        className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md mb-4"
                    >
                        <div className="relative overflow-hidden">
                            <img
                                src={imageUrl}
                                alt={caption || "Aktivitas Mitra"}
                                loading="lazy"
                                className="w-full h-auto object-cover block transition-transform duration-500 ease-out sm:group-hover:scale-105"
                                onError={(event) => {
                                    event.currentTarget.src = imagePlaceholder;
                                }}
                            />

                            {/* Desktop Overlay: Smooth hover transition */}
                            {caption && (
                                <div className="hidden sm:flex absolute inset-0 flex-col justify-end p-4 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none">
                                    <p className="text-xs font-semibold leading-relaxed text-white translate-y-3 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                        {caption}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Caption Box */}
                        {caption && (
                            <figcaption className="block sm:hidden p-3.5 text-xs font-semibold leading-relaxed text-slate-700 bg-white border-t border-slate-100">
                                {caption}
                            </figcaption>
                        )}
                    </figure>
                );
            })}
        </div>
    );
}
