import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons'
import { FooterHeading } from './FooterUI'
import type { Tag } from '../../../services/TagService'

type FooterTagsAndMapProps = {
  tags: Tag[]
  jakartaMapEmbed: string
  jakartaMapLink: string
}

export function FooterTagsAndMap({ tags, jakartaMapEmbed, jakartaMapLink }: FooterTagsAndMapProps) {
  return (
    <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      {/* LEFT: Tags */}
      {tags.length > 0 && (
        <div className="flex-1 min-w-0">
          <FooterHeading>Tag Populer</FooterHeading>
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <a
                key={tag.id}
                href={tag.url || "#"}
                target={tag.open_in_new_tab && tag.url ? "_blank" : "_self"}
                rel={tag.open_in_new_tab && tag.url ? "noreferrer" : undefined}
                className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                {tag.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* RIGHT: Google Maps */}
      <div className="w-full lg:w-[380px] flex-shrink-0">
        <FooterHeading>Lokasi Kami</FooterHeading>
        <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
          <iframe
            src={jakartaMapEmbed}
            width="100%"
            height="200"
            style={{ border: 0 }}
            loading="lazy"
            title="Lokasi DPF Jakarta"
            className="opacity-85 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <a
          href={jakartaMapLink}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-emerald-300 transition-colors"
        >
          <FontAwesomeIcon icon={faMapLocationDot} className="h-4 w-4" />
          Lihat di Google Maps (Jakarta)
        </a>
      </div>
    </div>
  )
}
