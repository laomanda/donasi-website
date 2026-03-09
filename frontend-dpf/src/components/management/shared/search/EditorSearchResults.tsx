import { useNavigate } from "react-router-dom";
import { 
  faBookOpen, 
  faHeart, 
  faHandshake, 
  faSitemap 
} from "@fortawesome/free-solid-svg-icons";
import SearchSectionCard from "./SearchSectionCard";
import SearchResultRow from "./SearchResultRow";
import { renderSectionContent } from "./SearchUIState";
import { 
  articleStatusLabel, 
  badgeTone, 
  formatDate, 
  resolveStorageUrl, 
  programStatusLabel 
} from "@/lib/search-utils";
import { imagePlaceholder } from "@/lib/placeholder";
import type { 
  LoadState, 
  Article, 
  Program, 
  Partner, 
  OrganizationMember 
} from "@/types/search";

type EditorSearchResultsProps = {
  articlesState: LoadState<Article>;
  programsState: LoadState<Program>;
  partnersState: LoadState<Partner>;
  membersState: LoadState<OrganizationMember>;
};

export default function EditorSearchResults({
  articlesState,
  programsState,
  partnersState,
  membersState,
}: EditorSearchResultsProps) {
  const navigate = useNavigate();

  return (
    <>
      <SearchSectionCard
        category="Konten"
        title="Artikel"
        description="Hasil paling relevan dari data artikel."
        count={articlesState.total}
        icon={faBookOpen}
        tone="primary"
      >
        {renderSectionContent(articlesState, "Tidak ada artikel yang cocok.", (item) => {
          const status = articleStatusLabel(String(item.status ?? ""));
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
              {status.label}
            </span>,
            item.category ? (
              <span key="category" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                {item.category}
              </span>
            ) : null,
          ].filter(Boolean);

          const imageUrl = resolveStorageUrl(item.thumbnail_path) ?? imagePlaceholder;
          return (
            <SearchResultRow
              key={item.id}
              title={item.title}
              subtitle={item.excerpt}
              imageUrl={imageUrl}
              metaLeft={meta}
              metaRight={<span className="text-[11px] font-semibold text-slate-500">Diperbarui: {formatDate(item.updated_at ?? item.created_at)}</span>}
              tone="primary"
              onClick={() => navigate(`/editor/articles/${item.id}/edit`)}
            />
          );
        })}
      </SearchSectionCard>

      <SearchSectionCard
        category="Konten"
        title="Program"
        description="Hasil paling relevan dari data program."
        count={programsState.total}
        icon={faHeart}
        tone="green"
      >
        {renderSectionContent(programsState, "Tidak ada program yang cocok.", (item) => {
          const status = programStatusLabel(String(item.status ?? ""));
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
              {status.label}
            </span>,
            item.category ? (
              <span key="category" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                {item.category}
              </span>
            ) : null,
          ].filter(Boolean);

          const imageUrl = resolveStorageUrl(item.thumbnail_path) ?? imagePlaceholder;
          return (
            <SearchResultRow
              key={item.id}
              title={item.title}
              subtitle={item.short_description}
              imageUrl={imageUrl}
              metaLeft={meta}
              metaRight={<span className="text-[11px] font-semibold text-slate-500">Diperbarui: {formatDate(item.updated_at ?? item.created_at)}</span>}
              tone="green"
              onClick={() => navigate(`/editor/programs/${item.id}/edit`)}
            />
          );
        })}
      </SearchSectionCard>

      <SearchSectionCard
        category="Organisasi"
        title="Mitra"
        description="Hasil paling relevan dari data mitra."
        count={partnersState.total}
        icon={faHandshake}
        tone="sky"
      >
        {renderSectionContent(partnersState, "Tidak ada mitra yang cocok.", (item) => {
          const active = Boolean(item.is_active);
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(active ? "green" : "red")}`}>
              {active ? "Aktif" : "Nonaktif"}
            </span>,
            item.url ? (
              <span key="url" className="inline-flex max-w-[14rem] items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 truncate">
                {String(item.url).replace(/^https?:\/\//, "")}
              </span>
            ) : null,
          ].filter(Boolean);

          const imageUrl = resolveStorageUrl(item.logo_path) ?? imagePlaceholder;
          return (
            <SearchResultRow
              key={item.id}
              title={item.name}
              subtitle={null}
              imageUrl={imageUrl}
              metaLeft={meta}
              tone="sky"
              onClick={() => navigate(`/editor/partners/${item.id}/edit`)}
            />
          );
        })}
      </SearchSectionCard>

      <SearchSectionCard
        category="Organisasi"
        title="Struktur"
        description="Hasil paling relevan dari data struktur."
        count={membersState.total}
        icon={faSitemap}
        tone="amber"
      >
        {renderSectionContent(membersState, "Tidak ada anggota struktur yang cocok.", (item) => {
          const active = Boolean(item.is_active);
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(active ? "green" : "red")}`}>
              {active ? "Aktif" : "Nonaktif"}
            </span>,
            <span key="group" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              {item.group}
            </span>,
          ];

          const imageUrl = resolveStorageUrl(item.photo_path) ?? imagePlaceholder;
          return (
            <SearchResultRow
              key={item.id}
              title={item.name}
              subtitle={item.position_title}
              imageUrl={imageUrl}
              metaLeft={meta}
              metaRight={<span className="text-[11px] font-semibold text-slate-500">Diperbarui: {formatDate(item.updated_at ?? item.created_at)}</span>}
              tone="amber"
              onClick={() => navigate(`/editor/organization-members/${item.id}`)}
            />
          );
        })}
      </SearchSectionCard>
    </>
  );
}
