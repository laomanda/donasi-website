import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faArrowUpRightFromSquare, faPlay } from "@fortawesome/free-solid-svg-icons";
import http from "@/lib/http";
import { useLang } from "@/lib/i18n";
import { translate } from "@/lib/i18n-utils";
import { imagePlaceholder } from "@/lib/placeholder";
import { socialMediaDict } from "./SocialMediaI18n";
import type { SocialMediaPayload } from "./SocialMediaTypes";

const emptyPayload: SocialMediaPayload = {
  instagram: [],
  youtube: [],
  meta: { instagram_enabled: false, youtube_enabled: false },
};

export default function SocialMediaSection() {
  const { locale } = useLang();
  const t = (key: string) => translate(socialMediaDict, locale, key);
  const [payload, setPayload] = useState<SocialMediaPayload>(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    http.get<SocialMediaPayload>("/social-media")
      .then((response) => {
        if (!active) return;
        setPayload({
          instagram: response.data.instagram ?? [],
          youtube: response.data.youtube ?? [],
          meta: response.data.meta ?? emptyPayload.meta,
        });
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (failed || (!loading && !payload.meta.instagram_enabled && !payload.meta.youtube_enabled)) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brandGreen-600">{t("social.badge")}</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-slate-900 sm:text-4xl">{t("social.title")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">{t("social.subtitle")}</p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-[24px] bg-slate-200/70" />)}
          </div>
        ) : (
          <div className="mt-12 space-y-14">
            {payload.meta.instagram_enabled && (
              <div>
                <h3 className="flex items-center gap-3 font-heading text-2xl font-bold text-slate-900"><FontAwesomeIcon icon={faInstagram} className="text-pink-600" />{t("social.instagram")}</h3>
                {payload.instagram.length > 0 ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{payload.instagram.map((post) => <a key={post.id} href={post.post_url} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="relative aspect-square overflow-hidden bg-slate-100"><img src={post.thumbnail_url || imagePlaceholder} alt={post.caption || t("social.instagram")} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = imagePlaceholder; }} />{post.type === "video" && <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white"><FontAwesomeIcon icon={faPlay} /></span>}</div><div className="p-5"><p className="line-clamp-3 text-sm leading-6 text-slate-600">{post.caption || t("social.instagram.open")}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-pink-600">{t("social.instagram.open")}<FontAwesomeIcon icon={faArrowUpRightFromSquare} /></span></div></a>)}</div> : <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">{t("social.empty")}</p>}
              </div>
            )}

            {payload.meta.youtube_enabled && (
              <div>
                <h3 className="flex items-center gap-3 font-heading text-2xl font-bold text-slate-900"><FontAwesomeIcon icon={faYoutube} className="text-red-600" />{t("social.youtube")}</h3>
                {payload.youtube.length > 0 ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{payload.youtube.map((video) => <a key={video.id} href={video.video_url} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="relative aspect-video overflow-hidden bg-slate-100"><img src={video.thumbnail_url || imagePlaceholder} alt={video.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = imagePlaceholder; }} /><span className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/25"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"><FontAwesomeIcon icon={faPlay} /></span></span></div><div className="p-5"><h4 className="line-clamp-2 font-heading text-lg font-bold text-slate-900">{video.title}</h4><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-red-600">{t("social.youtube.open")}<FontAwesomeIcon icon={faArrowUpRightFromSquare} /></span></div></a>)}</div> : <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">{t("social.empty")}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
