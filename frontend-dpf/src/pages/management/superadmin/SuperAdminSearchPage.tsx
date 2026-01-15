import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import http from "../../../lib/http";
import { readSearchLimit, SETTINGS_EVENT } from "../../../lib/settings";

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at?: string | null;
  roles?: { id?: number; name: string }[];
  role_label?: string | null;
};


const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const badgeTone = (tone: "neutral" | "green") => {
  if (tone === "green") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const getUserRoleLabel = (user: User) => {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const roleNames = roles.map((r) => String(r?.name ?? "").trim()).filter(Boolean);
  if (roleNames.length) return roleNames.join(", ");
  const label = String(user.role_label ?? "").trim();
  return label || "-";
};

function ResultRow({
  title,
  subtitle,
  metaLeft,
  metaRight,
  icon,
  onClick,
}: {
  title: string;
  subtitle?: string | null;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
  icon: any;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="group w-full text-left">
      <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition hover:bg-slate-50">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brandGreen-700 text-white shadow-sm">
          <FontAwesomeIcon icon={icon} className="text-sm" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{title}</p>
          {subtitle ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{subtitle}</p> : null}
          {(metaLeft || metaRight) ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
              <div className="flex flex-wrap items-center gap-2">{metaLeft}</div>
              {metaRight ? <div className="shrink-0">{metaRight}</div> : null}
            </div>
          ) : null}
        </div>

        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition group-hover:bg-slate-50">
          <FontAwesomeIcon icon={faUserGroup} className="text-sm opacity-0" />
        </span>
      </div>
    </button>
  );
}

export function SuperAdminSearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = useMemo(() => (params.get("q") ?? "").trim(), [params]);
  const [searchLimit, setSearchLimit] = useState(() => readSearchLimit());

  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    const onSync = () => setSearchLimit(readSearchLimit());
    window.addEventListener(SETTINGS_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

  useEffect(() => {
    if (!q) {
      setUsers([]);
      setUsersTotal(0);
      return;
    }

    let active = true;
    const term = q;
    const limit = searchLimit;

    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const res = await http.get<PaginationPayload<User>>("/superadmin/users", {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setUsers(res.data?.data ?? []);
        setUsersTotal(res.data?.total ?? 0);
      } catch {
        if (!active) return;
        setUsers([]);
        setUsersTotal(0);
        setUsersError("Gagal memuat hasil pengguna.");
      } finally {
        active && setUsersLoading(false);
      }
    };

    void loadUsers();

    return () => {
      active = false;
    };
  }, [q, searchLimit]);

  const totalResults = useMemo(() => usersTotal, [usersTotal]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-brandGreen-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-brandGreen-700 ring-1 ring-brandGreen-100">
            Pencarian
          </span>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Cari data SuperAdmin</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Temukan pengguna dan peran. Gunakan kolom pencarian di bilah atas untuk mengganti kata kunci.
          </p>

          {q ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-brandGreen-700 ring-1 ring-brandGreen-100">
                Kata kunci: <span className="ml-1 font-bold text-slate-900">{q}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-primary-700 ring-1 ring-primary-100">
                Total hasil: <span className="ml-1 font-bold">{totalResults}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {!q ? (
        <div className="rounded-[28px] border border-dashed border-brandGreen-100 bg-brandGreen-50 p-8 text-center text-sm font-semibold text-slate-700">
          Ketik kata kunci di kolom pencarian pada top bar untuk menampilkan hasil.
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-[0.2em] text-slate-400">Akses</p>
                <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-semibold text-slate-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brandGreen-700 text-white">
                    <FontAwesomeIcon icon={faUsers} className="text-sm" />
                  </span>
                  Pengguna
                </h2>
                <p className="mt-2 text-sm text-slate-600">Hasil paling relevan dari data pengguna.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {usersTotal} hasil
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {usersLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-slate-100" />
                        <div className="h-3 w-full rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))
              ) : usersError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {usersError}
                </div>
              ) : users.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  Tidak ada pengguna yang cocok.
                </div>
              ) : (
                users.map((u) => {
                  const tone = u.is_active ? "green" : "neutral";
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(tone)}`}>
                      {u.is_active ? "Aktif" : "Nonaktif"}
                    </span>,
                    <span key="role" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      {getUserRoleLabel(u)}
                    </span>,
                  ];

                  return (
                    <ResultRow
                      key={u.id}
                      title={u.name}
                      subtitle={u.email}
                      icon={faUserGroup}
                      metaLeft={meta}
                      metaRight={<span className="text-[11px] font-semibold text-slate-500">Dibuat: {formatDate(u.created_at)}</span>}
                      onClick={() => navigate(`/superadmin/users/${u.id}/edit`)}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminSearchPage;



