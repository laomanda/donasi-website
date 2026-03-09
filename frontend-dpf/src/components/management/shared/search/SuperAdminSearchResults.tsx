import { useNavigate } from "react-router-dom";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import SearchSectionCard from "./SearchSectionCard";
import SearchResultRow from "./SearchResultRow";
import { renderSectionContent } from "./SearchUIState";
import { 
  badgeTone, 
  getUserRoleLabel, 
  formatDate 
} from "@/lib/search-utils";
import type { LoadState, User } from "@/types/search";

type SuperAdminSearchResultsProps = {
  usersState: LoadState<User>;
};

export default function SuperAdminSearchResults({
  usersState,
}: SuperAdminSearchResultsProps) {
  const navigate = useNavigate();

  return (
    <SearchSectionCard
      category="Akses"
      title="Pengguna"
      description="Hasil paling relevan dari data pengguna."
      count={usersState.total}
      icon={faUsers}
      tone="green"
    >
      {renderSectionContent(usersState, "Tidak ada pengguna yang cocok.", (item) => {
        const meta = [
          <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(item.is_active ? "green" : "neutral")}`}>
            {item.is_active ? "Aktif" : "Nonaktif"}
          </span>,
          <span key="role" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
            {getUserRoleLabel(item)}
          </span>,
        ];

        return (
          <SearchResultRow
            key={item.id}
            title={item.name}
            subtitle={item.email}
            icon={faUsers}
            metaLeft={meta}
            metaRight={<span className="text-[11px] font-semibold text-slate-500">Dibuat: {formatDate(item.created_at)}</span>}
            tone="green"
            onClick={() => navigate(`/superadmin/users/${item.id}/edit`)}
          />
        );
      })}
    </SearchSectionCard>
  );
}
