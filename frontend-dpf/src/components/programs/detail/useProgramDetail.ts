import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import type { 
  Program, 
  Donation, 
  ProgramUpdate, 
  ProgramShowResponse 
} from "../ProgramShared";
import { 
  pickLocale, 
  getImageUrl,
  canonicalStatus
} from "../ProgramShared";
import imagePlaceholder from "../../../brand/assets/image-placeholder.jpg";

export function useProgramDetail(locale: "id" | "en", t: (key: string, fallback?: string) => string) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<ProgramUpdate[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<"not_found" | "load_failed" | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"detail" | "updates" | "donors">("detail");
  const [donorQuery, setDonorQuery] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch program data
  useEffect(() => {
    if (!slug) {
      setErrorKey("not_found");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    http
      .get<ProgramShowResponse>(`/programs/${slug}`)
      .then((res) => {
        if (!active) return;
        setProgram(res.data.program);
        const rawProgress = Number(res.data.progress_percent ?? 0);
        setProgressPercent(Number.isFinite(rawProgress) ? Math.max(rawProgress, 0) : 0);
        setRecentDonations(res.data.recent_donations ?? []);
        setLatestUpdates(res.data.latest_updates ?? []);
        setErrorKey(null);
      })
      .catch(() => {
        if (!active) return;
        setErrorKey("load_failed");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [slug]);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // Localized program data
  const localizedProgram = useMemo(() => {
    if (!program) return null;
    return {
      ...program,
      title: pickLocale(program.title, program.title_en, locale),
      category: pickLocale(program.category, program.category_en, locale) || t("landing.programs.defaultCategory"),
      short_description: pickLocale(program.short_description, program.short_description_en, locale),
      description: pickLocale(program.description, program.description_en, locale),
      benefits: pickLocale(program.benefits, program.benefits_en, locale),
    };
  }, [program, locale, t]);

  const isCompleted = useMemo(() => {
    return canonicalStatus(program?.status, program?.deadline_days) === "completed";
  }, [program?.status, program?.deadline_days]);

  const deadlineText = useMemo(() => {
    const raw = localizedProgram?.deadline_days;
    if (raw === null || raw === undefined || String(raw).trim() === "") {
      return t("landing.programs.deadline.unlimited");
    }
    return `${raw} ${locale === "en" ? "days" : "hari"}`;
  }, [localizedProgram?.deadline_days, locale, t]);

  // Gallery logic
  const galleryUrls = useMemo(() => {
    if (!program) return [imagePlaceholder];
    const raw = Array.isArray(program.program_images) ? program.program_images : [];
    const cleaned = raw.map((value) => String(value ?? "").trim()).filter(Boolean);
    if (cleaned.length) return cleaned.map(path => getImageUrl(path));
    
    const fallback = program.banner_path ?? program.thumbnail_path ?? "";
    return fallback ? [getImageUrl(fallback)] : [imagePlaceholder];
  }, [program]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [galleryUrls.join("|")]);

  useEffect(() => {
    if (galleryUrls.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % galleryUrls.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [galleryUrls.length]);

  // Share logic
  const shareUrl = typeof window !== "undefined" && slug ? `${window.location.origin}/program/${slug}` : "";
  const shareText = localizedProgram?.title ? `${localizedProgram.title} - ${shareUrl}` : shareUrl;

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: localizedProgram?.title ?? "Program DPF",
          text: localizedProgram?.short_description ?? localizedProgram?.title ?? "",
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus(locale === "en" ? "Link copied" : "Tautan disalin");
        setTimeout(() => setShareStatus(null), 2000);
      }
    } catch {
      setShareStatus(locale === "en" ? "Failed to share" : "Gagal membagikan");
      setTimeout(() => setShareStatus(null), 2000);
    }
  }, [localizedProgram, shareUrl, locale]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus(locale === "en" ? "Link copied" : "Tautan disalin");
      setTimeout(() => setShareStatus(null), 2000);
    } catch {
      setShareStatus(locale === "en" ? "Failed to copy" : "Gagal menyalin");
      setTimeout(() => setShareStatus(null), 2000);
    }
  }, [shareUrl, locale]);

  // Donation filtering
  const filteredDonations = useMemo(() => {
    const term = donorQuery.trim().toLowerCase();
    if (!term) return recentDonations;
    return recentDonations.filter((donation) => {
      const name = String(donation.donor_name ?? "").trim().toLowerCase();
      return name.includes(term);
    });
  }, [donorQuery, recentDonations]);

  return {
    slug,
    navigate,
    program,
    localizedProgram,
    recentDonations,
    filteredDonations,
    latestUpdates,
    progressPercent,
    loading,
    errorKey,
    shareStatus,
    activeTab,
    setActiveTab,
    donorQuery,
    setDonorQuery,
    activeImageIndex,
    setActiveImageIndex,
    galleryUrls,
    isCompleted,
    deadlineText,
    handleShare,
    handleCopyLink,
    shareText,
    shareUrl
  };
}
