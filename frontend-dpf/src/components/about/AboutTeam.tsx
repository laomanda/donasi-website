import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleGroup, faRibbon } from "@fortawesome/free-solid-svg-icons";
import { GROUP_LABEL_KEYS } from "./AboutShared";
import type { OrganizationMember } from "./AboutShared";
import { resolveStorageUrl } from "../../lib/urls";
import { imagePlaceholder } from "@/lib/placeholder";

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
                        if (GROUP_LABEL_KEYS[key]) return t(GROUP_LABEL_KEYS[key]);
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
                      const groupLabel = GROUP_LABEL_KEYS[key] 
                        ? t(GROUP_LABEL_KEYS[key]) 
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
                      const groupLabel = GROUP_LABEL_KEYS[key] 
                        ? t(GROUP_LABEL_KEYS[key]) 
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

const getImageUrl = (path?: string | null) => resolveStorageUrl(path, imagePlaceholder);
