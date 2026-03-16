import { LandingLayout } from "../layouts/LandingLayout";
import { useLang } from "../lib/i18n";
import { translate } from "../lib/i18n-utils";
import { programDict } from "../components/programs/ProgramI18n";
import { useProgramDetail } from "../components/programs/detail/useProgramDetail";
import { ProgramDetailActionHeader } from "../components/programs/detail/ProgramDetailActionHeader";
import { ProgramDetailGallery } from "../components/programs/detail/ProgramDetailGallery";
import { ProgramDetailInfo } from "../components/programs/detail/ProgramDetailInfo";
import { ProgramDetailSidebar } from "../components/programs/detail/ProgramDetailSidebar";
import { ProgramDetailSkeleton } from "../components/programs/detail/ProgramDetailSkeleton";

export function ProgramDetailPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(programDict, locale, key, fallback);

  const {
    localizedProgram,
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
    program,
    recentDonations,
    filteredDonations,
    latestUpdates,
    progressPercent
  } = useProgramDetail(locale, t);

  return (
    <LandingLayout>
      <section id="hero" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <ProgramDetailActionHeader 
            programId={Number(program?.id)}
            locale={locale}
            shareStatus={shareStatus}
            onShare={handleShare}
            onCopyLink={handleCopyLink}
          />

          {loading ? (
            <ProgramDetailSkeleton />
          ) : errorKey ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorKey === "not_found"
                ? locale === "en"
                  ? "Program not found."
                  : "Program tidak ditemukan."
                : locale === "en"
                  ? "Failed to load program details."
                  : "Gagal memuat detail program."}
            </div>
          ) : localizedProgram ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="space-y-8">
                <ProgramDetailGallery 
                  galleryUrls={galleryUrls.filter((url): url is string => !!url)}
                  activeImageIndex={activeImageIndex}
                  setActiveImageIndex={setActiveImageIndex}
                  programTitle={localizedProgram.title}
                />

                <ProgramDetailInfo 
                  program={program!}
                  localizedProgram={localizedProgram}
                  locale={locale}
                  t={t}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  recentDonations={recentDonations}
                  filteredDonations={filteredDonations}
                  latestUpdates={latestUpdates}
                  donorQuery={donorQuery}
                  setDonorQuery={setDonorQuery}
                />
              </div>

              <ProgramDetailSidebar 
                program={program!}
                localizedProgram={localizedProgram}
                locale={locale}
                t={t}
                progressPercent={progressPercent}
                isCompleted={isCompleted}
                deadlineText={deadlineText}
                shareText={shareText}
              />
            </div>
          ) : null}
        </div>
      </section>
    </LandingLayout>
  );
}

export default ProgramDetailPage;
