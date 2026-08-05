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

export default function GalleryDpfGrid({ items, locale, emptyLabel }: Props) {
    if (items.length === 0) {
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
                        className="break-inside-avoid overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                    >
                        <img
                            src={imageUrl}
                            alt={caption || "Aktivitas DPF"}
                            loading="lazy"
                            className="w-full h-auto object-cover block"
                            onError={(event) => {
                                event.currentTarget.src = imagePlaceholder;
                            }}
                        />
                        {caption && (
                            <figcaption className="p-3.5 text-xs font-semibold leading-relaxed text-slate-700 bg-white">
                                {caption}
                            </figcaption>
                        )}
                    </figure>
                );
            })}
        </div>
    );
}
