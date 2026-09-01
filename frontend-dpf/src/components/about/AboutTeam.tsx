import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie } from "@fortawesome/free-solid-svg-icons";
import dpfWakafLogo from "../../assets/brand/dpf-wakaf.webp";
import { GROUP_LABEL_KEYS } from "./AboutShared";
import type { OrganizationMember } from "./AboutShared";

type AboutTeamProps = {
  t: (key: string, fallback?: string) => string;
  locale: string;
  loadingMembers: boolean;
  errorMembersKey: string | null;
  groupedMembers: {
    buckets: Record<string, (OrganizationMember & { name: string; position_title: string })[]>;
    sortedGroupKeys: string[];
  };
};

export function AboutTeam({ t, locale, loadingMembers, errorMembersKey, groupedMembers }: AboutTeamProps) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">
            {t("about.team.label")}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-slate-900 tracking-tight">
            {t("about.team.heading")}
          </h2>
        </div>

        {errorMembersKey && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {t("about.team.error")}
          </div>
        )}

        {loadingMembers ? (
          <div className="mt-12 flex flex-wrap justify-center gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`member-skel-${idx}`} className="w-full sm:w-[320px] lg:w-[340px]">
                <MemberSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 space-y-12">
            {groupedMembers.sortedGroupKeys.map((key) => (
              <div key={key} className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-heading font-bold text-slate-900">
                    {(() => {
                      if (GROUP_LABEL_KEYS[key]) return t(GROUP_LABEL_KEYS[key]);
                      const first = groupedMembers.buckets[key][0];
                      const label = (locale === "en" && first.group_en) ? first.group_en : (first.group || key);
                      return label.charAt(0).toUpperCase() + label.slice(1);
                    })()}
                  </h3>
                </div>

                <div className="flex flex-wrap justify-center gap-5">
                  {groupedMembers.buckets[key].map((person) => {
                    const groupLabel = GROUP_LABEL_KEYS[key] 
                      ? t(GROUP_LABEL_KEYS[key]) 
                      : (() => {
                          const label = (locale === "en" && person.group_en) ? person.group_en : (person.group || key);
                          return label.charAt(0).toUpperCase() + label.slice(1);
                        })();
                    const positionLabel = (locale === "en" && person.position_title_en)
                      ? person.position_title_en
                      : person.position_title;
                    return (
                      <div key={person.id} className="w-full sm:w-[320px] lg:w-[340px]">
                        <MemberCard
                          name={person.name}
                          position={positionLabel}
                          groupLabel={groupLabel}
                        />
                      </div>
                    );
                  })}
                </div>
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
  );
}

function MemberCard({ name, position, groupLabel }: { name: string; position: string; groupLabel: string }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl rounded-tl-md rounded-br-md border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <FontAwesomeIcon icon={faUserTie} className="text-base" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
              {name}
            </h4>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 line-clamp-1">
              {position}
            </p>
          </div>
        </div>

        <img
          src={dpfWakafLogo}
          alt="DPF Wakaf"
          className="h-7 w-auto shrink-0 object-contain"
        />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {groupLabel}
        </span>
      </div>
    </div>
  );
}

function MemberSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-50">
        <div className="h-3 w-16 rounded bg-slate-100" />
      </div>
    </div>
  );
}
