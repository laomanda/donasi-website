import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
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
    http
      .get<SocialMediaPayload>("/social-media")
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

    return () => {
      active = false;
    };
  }, []);

  if (failed || (!loading && !payload.meta.instagram_enabled && !payload.meta.youtube_enabled)) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brandGreen-600">
            {t("social.badge")}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-slate-900 sm:text-4xl">
            {t("social.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
            {t("social.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[16/9] animate-pulse rounded-3xl bg-slate-200/70"
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {/* Instagram Section */}
            {payload.meta.instagram_enabled && (
              <div>
                <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                    <FontAwesomeIcon icon={faInstagram} className="text-lg" />
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-slate-900">
                    {t("social.instagram")}
                  </h3>
                </div>

                {payload.instagram.length > 0 ? (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {payload.instagram.map((post) => (
                      <a
                        key={post.id}
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                      >
                        {/* Post Header Bar */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
                              <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[10px] text-pink-600">
                                <FontAwesomeIcon icon={faInstagram} />
                              </span>
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              Instagram Post
                            </span>
                          </div>
                          <FontAwesomeIcon icon={faInstagram} className="text-sm text-slate-300" />
                        </div>

                        {/* Image Media Container */}
                        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                          <img
                            src={post.thumbnail_url || imagePlaceholder}
                            alt={post.caption || t("social.instagram")}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.src = imagePlaceholder;
                            }}
                          />
                          {post.type === "video" && (
                            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md">
                              <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
                            </span>
                          )}
                        </div>

                        {/* Caption Body */}
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <p className="line-clamp-3 min-h-[3.75rem] text-xs leading-relaxed text-slate-600">
                            {post.caption || "Instagram Post"}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    {t("social.empty")}
                  </p>
                )}
              </div>
            )}

            {/* YouTube Section */}
            {payload.meta.youtube_enabled && (
              <div>
                <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm">
                    <FontAwesomeIcon icon={faYoutube} className="text-lg" />
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-slate-900">
                    {t("social.youtube")}
                  </h3>
                </div>

                {payload.youtube.length > 0 ? (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {payload.youtube.map((video) => (
                      <a
                        key={video.id}
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-red-200 hover:shadow-md"
                      >
                        {/* Video Thumbnail */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                          <img
                            src={video.thumbnail_url || imagePlaceholder}
                            alt={video.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                            onError={(event) => {
                              event.currentTarget.src = imagePlaceholder;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                          {/* Center Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-white/30 transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14">
                              <FontAwesomeIcon icon={faPlay} className="ml-1 text-sm sm:text-base" />
                            </div>
                          </div>

                          {/* Badge Pill */}
                          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                            <FontAwesomeIcon icon={faYoutube} className="text-red-500" />
                            <span>YouTube</span>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex flex-1 flex-col justify-between p-5">
                          <h4 className="line-clamp-2 min-h-[2.75rem] font-heading text-base font-bold leading-snug text-slate-900">
                            {video.title}
                          </h4>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    {t("social.empty")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
