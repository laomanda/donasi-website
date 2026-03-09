import { faBookOpen, faCheckCircle, faClock, faHeart, faChartPie, faUserGroup, faSitemap, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { StatCard } from "./EditorDashboardUI";

type Props = {
  loading: boolean;
  stats: {
    articlesDraft: number;
    articlesReview: number;
    articlesPublished: number;
    articlesTotal: number;
    programsActive: number;
    programsInactive: number;
    programsTotal: number;
    programsHighlight: number;
    partnersActive: number;
    organizationMembers: number;
  };
};

const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export default function EditorDashboardStats({ loading, stats }: Props) {
  return (
    <div className="space-y-6">
      {/* ROW 1 – Statistik Artikel & Program Utama */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          loading={loading}
          title="Artikel Draf"
          value={formatCount(stats.articlesDraft)}
          icon={faPenToSquare}
          theme="amber"
        />
        <StatCard
          loading={loading}
          title="Artikel Terbit"
          value={formatCount(stats.articlesPublished)}
          icon={faCheckCircle}
          theme="emerald"
        />
        <StatCard
          loading={loading}
          title="Program Aktif"
          value={formatCount(stats.programsActive)}
          icon={faHeart}
          theme="rose"
        />
        <StatCard
          loading={loading}
          title="Program Nonaktif"
          value={formatCount(stats.programsInactive)}
          icon={faChartPie}
          theme="slate"
        />
      </section>

      {/* ROW 2 – Ringkasan tambahan */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          loading={loading}
          title="Artikel Review"
          value={formatCount(stats.articlesReview)}
          icon={faClock}
          theme="violet"
        />
        <StatCard
          loading={loading}
          title="Total Artikel"
          value={formatCount(stats.articlesTotal)}
          icon={faBookOpen}
          theme="slate"
        />
        <StatCard
          loading={loading}
          title="Program Unggulan"
          value={formatCount(stats.programsHighlight)}
          icon={faHeart}
          theme="rose"
        />
        <StatCard
          loading={loading}
          title="Mitra Aktif"
          value={formatCount(stats.partnersActive)}
          icon={faUserGroup}
          theme="emerald"
        />
        <StatCard
          loading={loading}
          title="Anggota Organisasi"
          value={formatCount(stats.organizationMembers)}
          icon={faSitemap}
          theme="amber"
        />
      </section>
    </div>
  );
}
