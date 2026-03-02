import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheckCircle,
  faHandHoldingHeart,
  faHandshakeSimple,
  faHeartPulse,
  faPeopleGroup,
  faRibbon,
  faShieldHalved,
  faSquareCheck,
  faStar,
  faTimeline,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { PageHero } from "../components/PageHero";

import http from "../lib/http";
import { resolveStorageBaseUrl } from "../lib/urls";
import imagePlaceholder from "../brand/assets/image-placeholder.jpg";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

type ValueCard = {
  title: string;
  desc: string;
  icon: any;
};

type TimelineItem = {
  year: string;
  title: string;
  desc: string;
};

type OrganizationMember = {
  id: number;
  name: string;
  position_title: string;
  group: string | null;
  group_en?: string | null;
  photo_path?: string | null;
  show_contact?: boolean;
  email?: string | null;
  phone?: string | null;
  order: number;
};




const missionItemKeys = [
  "about.mission.item1",
  "about.mission.item2",
  "about.mission.item3",
  "about.mission.item4",
  "about.mission.item5",
];

const valueItems: ValueCard[] = [
  { title: "about.values.trust.title", desc: "about.values.trust.desc", icon: faShieldHalved },
  { title: "about.values.transparency.title", desc: "about.values.transparency.desc", icon: faSquareCheck },
  { title: "about.values.collaboration.title", desc: "about.values.collaboration.desc", icon: faHandshakeSimple },
  { title: "about.values.sustainability.title", desc: "about.values.sustainability.desc", icon: faHeartPulse },
];

const timeline: (TimelineItem & { titleKey: string; descKey: string; yearKey?: string })[] = [
  {
    year: "2010",
    title: "",
    desc: "",
    titleKey: "about.timeline.2010.title",
    descKey: "about.timeline.2010.desc",
  },
  {
    year: "2015",
    title: "",
    desc: "",
    titleKey: "about.timeline.2015.title",
    descKey: "about.timeline.2015.desc",
  },
  {
    year: "2020",
    title: "",
    desc: "",
    titleKey: "about.timeline.2020.title",
    descKey: "about.timeline.2020.desc",
  },
  {
    year: "2022",
    title: "",
    desc: "",
    titleKey: "about.timeline.2022.title",
    descKey: "about.timeline.2022.desc",
  },
  {
    year: "",
    yearKey: "about.timeline.now.year",
    title: "",
    desc: "",
    titleKey: "about.timeline.now.title",
    descKey: "about.timeline.now.desc",
  },
];

const legalItemKeys = [
  "about.legal.item1",
  "about.legal.item2",
  "about.legal.item3",
  "about.legal.item4",
  "about.legal.item5",
  "about.legal.item6",
  "about.legal.item7",
  "about.legal.item8",
  "about.legal.item9",
  "about.legal.item10",
];

const groupLabelKeys: Record<string, string> = {
  pembina: "about.team.group.pembina",
  pengawas: "about.team.group.pengawas",
  pengurus: "about.team.group.pengurus",
  staff: "about.team.group.staff",
  relawan: "about.team.group.relawan",
  lainnya: "about.team.group.lainnya",
};

const groupOrder = ["pembina", "pengawas", "pengurus", "staff", "relawan", "lainnya"];

const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};

function TentangKamiPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembersKey, setErrorMembersKey] = useState<"fetch_failed" | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingMembers(true);
    http
      .get<{ structure: OrganizationMember[] }>("/organization")
      .then((res) => {
        if (!active) return;
        setMembers(res.data?.structure ?? []);
        setErrorMembersKey(null);
      })
      .catch(() => {
        if (!active) return;
        setErrorMembersKey("fetch_failed");
      })
      .finally(() => active && setLoadingMembers(false));

    return () => {
      active = false;
    };
  }, []);

  const groupedMembers = useMemo(() => {
    const buckets: Record<string, (OrganizationMember & { name: string; position_title: string })[]> = {};
    
    members.forEach((member) => {
      const key = String(member.group ?? "lainnya").toLowerCase();
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push({
        ...member,
        name: member.name,
        position_title: member.position_title,
      });
    });

    // Sort items within each bucket by member ID (Terlama -> Terbaru)
    Object.keys(buckets).forEach((key) => {
      buckets[key] = buckets[key].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    });

    // Sort group keys based on the minimum order of members in that group
    const sortedGroupKeys = Object.keys(buckets).sort((a, b) => {
      const minA = Math.min(...buckets[a].map(m => Number(m.order ?? 0)));
      const minB = Math.min(...buckets[b].map(m => Number(m.order ?? 0)));
      
      if (minA !== minB) return minA - minB;
      
      // Fallback to predefined order for stability
      const idxA = groupOrder.indexOf(a);
      const idxB = groupOrder.indexOf(b);
      const effectiveIdxA = idxA === -1 ? 999 : idxA;
      const effectiveIdxB = idxB === -1 ? 999 : idxB;
      
      if (effectiveIdxA !== effectiveIdxB) return effectiveIdxA - effectiveIdxB;
      return a.localeCompare(b);
    });

    return { buckets, sortedGroupKeys };
  }, [members, locale]);

  const timelineCards = useMemo(
    () =>
      timeline.map((item) => ({
        ...item,
        year: item.yearKey ? t(item.yearKey) : item.year,
        title: t(item.titleKey),
        desc: t(item.descKey),
      })),
    [locale]
  );

  const missionList = useMemo(() => missionItemKeys.map((key) => t(key)), [locale]);

  const valueCards = useMemo(
    () => valueItems.map((val) => ({ ...val, title: t(val.title), desc: t(val.desc) })),
    [locale]
  );

  const legalItems = useMemo(() => legalItemKeys.map((key) => t(key)), [locale]);

  return (
    <LandingLayout footerWaveBgClassName="bg-slate-50">
      {/* HERO */}
      <PageHero
        badge={t("about.hero.badge")}
        title={
          <>
            {t("about.hero.title.leading")}{" "}
            <span className="text-primary-600">{t("about.hero.title.highlight")}</span>{" "}
            {t("about.hero.title.trailing")}
          </>
        }
        subtitle={t("about.hero.subtitle")}
        breadcrumb={[
          { label: t("landing.navbar.about", "Tentang Kami") }
        ]}
        rightElement={
          <div className="rounded-[32px] border border-white/60 bg-white/40 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg">
              <FontAwesomeIcon icon={faHandHoldingHeart} className="text-lg" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">{t("about.hero.mandate.badge")}</p>
                <p className="text-base font-bold leading-tight">{t("about.hero.mandate.title")}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <StatLine label={t("about.hero.stats.1.label")} value={t("about.hero.stats.1.value")} />
              <StatLine label={t("about.hero.stats.2.label")} value={t("about.hero.stats.2.value")} />
              <StatLine label={t("about.hero.stats.3.label")} value={t("about.hero.stats.3.value")} />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#legalitas"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
              >
                <FontAwesomeIcon icon={faShieldHalved} />
                {t("about.hero.cta.legal")}
              </a>
              <a
                href="#visi-misi"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white/80 px-6 py-3 text-sm font-bold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                <FontAwesomeIcon icon={faArrowRight} />
                {t("about.hero.cta.vision")}
              </a>
            </div>
          </div>
        }
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.4)]">
            <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <FontAwesomeIcon icon={faPeopleGroup} className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.section.intro.label")}</p>
                <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("about.section.intro.heading")}</h2>
              </div>
            </div>
            <p className="mt-6 text-base leading-relaxed text-slate-700">
              {t("about.section.intro.body")}
            </p>
          </div>
        </div>
      </section>

      {/* SEJARAH */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <FontAwesomeIcon icon={faTimeline} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.history.label")}</p>
              <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("about.history.heading")}</h2>
            </div>
          </div>

          <p className="mt-6 text-base leading-relaxed text-slate-700">
            {t("about.history.body1")}
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            {t("about.history.body2")}
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            {t("about.history.body3")}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {timelineCards.map((item) => (
              <div key={item.yearKey ?? item.year} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">{item.year}</span>
                  <FontAwesomeIcon icon={faStar} className="text-primary-400" />
                </div>
                <h3 className="mt-2 text-lg font-heading font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISI MISI */}
      <section id="visi-misi" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brandGreen-600 to-emerald-500 p-10 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.65)]">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-50">{t("about.vision.label")}</p>
              <div className="mt-4 text-4xl">"</div>
              <p className="text-2xl leading-relaxed font-heading">{t("about.vision.text")}</p>
              <div className="mt-6 flex items-center gap-3 text-emerald-100">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <span className="text-sm font-semibold">{t("about.vision.tagline")}</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <FontAwesomeIcon icon={faHeartPulse} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.mission.label")}</p>
                  <h3 className="text-lg font-heading font-semibold text-slate-900">{t("about.mission.heading")}</h3>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                {missionItemKeys.map((key, idx) => (
                  <li key={key} className="flex gap-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="mt-1 text-primary-600" />
                    <span>{missionList[idx]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* values */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {valueCards.map((val) => (
              <div key={val.title} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">
                  <FontAwesomeIcon icon={val.icon} />
                </div>
                <h4 className="mt-3 text-lg font-heading font-semibold text-slate-900">{val.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIM DINAMIS */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <FontAwesomeIcon icon={faPeopleGroup} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.team.label")}</p>
              <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("about.team.heading")}</h2>
            </div>
          </div>

          {errorMembersKey && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {t("about.team.error")}
            </div>
          )}

          {loadingMembers ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <MemberSkeleton key={`member-skel-${idx}`} />
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {groupedMembers.sortedGroupKeys.map((key) => (
                <div key={key} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">
                      <FontAwesomeIcon icon={faRibbon} />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-slate-900">
                        {(() => {
                          if (groupLabelKeys[key]) return t(groupLabelKeys[key]);
                          const first = groupedMembers.buckets[key][0];
                          const label = (locale === "en" && first.group_en) ? first.group_en : (first.group || key);
                          return label.charAt(0).toUpperCase() + label.slice(1);
                        })()}
                      </h3>
                    </div>
                  </div>
                  {groupedMembers.buckets[key].length < 4 ? (
                    <div className="flex flex-wrap justify-center gap-6">
                      {groupedMembers.buckets[key].map((person) => {
                        const groupLabel = groupLabelKeys[key] 
                          ? t(groupLabelKeys[key]) 
                          : (() => {
                              const label = (locale === "en" && person.group_en) ? person.group_en : (person.group || key);
                              return label.charAt(0).toUpperCase() + label.slice(1);
                            })();
                        return (
                          <div key={person.id} className="w-full sm:w-[280px] lg:w-[260px]">
                            <MemberCard member={person} groupLabel={groupLabel} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {groupedMembers.buckets[key].map((person) => {
                        const groupLabel = groupLabelKeys[key] 
                          ? t(groupLabelKeys[key]) 
                          : (() => {
                              const label = (locale === "en" && person.group_en) ? person.group_en : (person.group || key);
                              return label.charAt(0).toUpperCase() + label.slice(1);
                            })();
                        return (
                          <MemberCard key={person.id} member={person} groupLabel={groupLabel} />
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {groupedMembers.sortedGroupKeys.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                  {t("about.team.empty")}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* LEGALITAS */}
      <section id="legalitas" className="bg-slate-50 pt-16 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.legal.label")}</p>
                <h3 className="text-xl font-heading font-semibold text-slate-900">{t("about.legal.heading")}</h3>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {legalItems.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  <FontAwesomeIcon icon={faCheckCircle} className="mt-1 text-primary-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://wa.me/6281311768254"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brandGreen-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brandGreen-500/25 transition hover:-translate-y-0.5 hover:bg-brandGreen-700"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
                {t("about.legal.cta.collab")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <FontAwesomeIcon icon={faStar} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="text-sm font-heading font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function MemberCard({ member, groupLabel }: { member: OrganizationMember; groupLabel: string }) {
  const photo = getImageUrl(member.photo_path);
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_18px_40px_-22px_rgba(0,0,0,0.35)]">
      <div className="aspect-[4/5] w-full overflow-hidden bg-slate-50">
        <img
          src={photo}
          alt={member.name}
          className="h-full w-full object-cover"
          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
        />
      </div>
      <div className="p-5 text-center space-y-2">
        <p className="text-base font-heading font-semibold text-slate-900 leading-tight">{member.name}</p>
        <p className="text-sm font-semibold text-amber-600 italic">{groupLabel}</p>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{member.position_title}</p>
      </div>
    </div>
  );
}

function MemberSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-slate-100" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-slate-100" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-3/4 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default TentangKamiPage;
export { TentangKamiPage };
