import { useEffect, useMemo, useState } from "react";
import http from "../../lib/http";
import { useLang } from "../../lib/i18n";
import { landingDict, translate as translateLanding } from "../../i18n/landing";
import { 
  MISSION_ITEM_KEYS, 
  VALUE_ITEMS, 
  TIMELINE, 
  LEGAL_ITEM_KEYS, 
  GROUP_ORDER 
} from "./AboutShared";
import type { OrganizationMember } from "./AboutShared";

export function useAbout() {
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
      const idxA = GROUP_ORDER.indexOf(a);
      const idxB = GROUP_ORDER.indexOf(b);
      const effectiveIdxA = idxA === -1 ? 999 : idxA;
      const effectiveIdxB = idxB === -1 ? 999 : idxB;
      
      if (effectiveIdxA !== effectiveIdxB) return effectiveIdxA - effectiveIdxB;
      return a.localeCompare(b);
    });

    return { buckets, sortedGroupKeys };
  }, [members, locale]);

  const timelineCards = useMemo(
    () =>
      TIMELINE.map((item) => ({
        ...item,
        year: item.yearKey ? t(item.yearKey) : item.year,
        title: t(item.titleKey),
        desc: t(item.descKey),
      })),
    [locale]
  );

  const missionList = useMemo(() => MISSION_ITEM_KEYS.map((key) => t(key)), [locale]);

  const valueCards = useMemo(
    () => VALUE_ITEMS.map((val) => ({ ...val, title: t(val.title), desc: t(val.desc) })),
    [locale]
  );

  const legalItems = useMemo(() => LEGAL_ITEM_KEYS.map((key) => t(key)), [locale]);

  return {
    locale,
    t,
    loadingMembers,
    errorMembersKey,
    groupedMembers,
    timelineCards,
    missionList,
    valueCards,
    legalItems
  };
}
