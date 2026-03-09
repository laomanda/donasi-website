import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import http from "../../../lib/http";
import { readSearchLimit, SETTINGS_EVENT } from "../../../lib/settings";

// Types
import type { 
  SearchRole, 
  LoadState, 
  Article, 
  Program, 
  Partner, 
  OrganizationMember, 
  Donation, 
  EditorTask, 
  PickupRequest, 
  Consultation, 
  BankAccount, 
  User,
  PaginationPayload
} from "@/types/search";

// Utils
import { 
  createInitialState, 
  sectionBadgeTone 
} from "@/lib/search-utils";

// Components
import AdminSearchResults from "@/components/management/shared/search/AdminSearchResults";
import EditorSearchResults from "@/components/management/shared/search/EditorSearchResults";
import SuperAdminSearchResults from "@/components/management/shared/search/SuperAdminSearchResults";

const headerCopy: Record<SearchRole, { title: string; description: string; tagTone: "primary" | "green" }> = {
  editor: {
    title: "Hasil pencarian",
    description: "Menampilkan hasil dari artikel, program, mitra, dan struktur organisasi.",
    tagTone: "primary",
  },
  admin: {
    title: "Pencarian Admin",
    description:
      "Temukan donasi, konfirmasi donasi, tugas editor, jemput wakaf, dan konsultasi. Gunakan kolom pencarian di bilah atas untuk mengganti kata kunci.",
    tagTone: "primary",
  },
  superadmin: {
    title: "Cari data SuperAdmin",
    description: "Temukan pengguna dan peran. Gunakan kolom pencarian di bilah atas untuk mengganti kata kunci.",
    tagTone: "green",
  },
};

export function SearchPage({ role }: { role: SearchRole }) {
  const [params] = useSearchParams();
  const q = useMemo(() => (params.get("q") ?? "").trim(), [params]);
  const [searchLimit, setSearchLimit] = useState(() => readSearchLimit());

  const [articlesState, setArticlesState] = useState<LoadState<Article>>(() => createInitialState<Article>());
  const [programsState, setProgramsState] = useState<LoadState<Program>>(() => createInitialState<Program>());
  const [partnersState, setPartnersState] = useState<LoadState<Partner>>(() => createInitialState<Partner>());
  const [membersState, setMembersState] = useState<LoadState<OrganizationMember>>(() => createInitialState<OrganizationMember>());
  const [donationsState, setDonationsState] = useState<LoadState<Donation>>(() => createInitialState<Donation>());
  const [donationConfirmationsState, setDonationConfirmationsState] = useState<LoadState<Donation>>(() => createInitialState<Donation>());
  const [editorTasksState, setEditorTasksState] = useState<LoadState<EditorTask>>(() => createInitialState<EditorTask>());
  const [pickupRequestsState, setPickupRequestsState] = useState<LoadState<PickupRequest>>(() => createInitialState<PickupRequest>());
  const [consultationsState, setConsultationsState] = useState<LoadState<Consultation>>(() => createInitialState<Consultation>());
  const [bankAccountsState, setBankAccountsState] = useState<LoadState<BankAccount>>(() => createInitialState<BankAccount>());
  const [usersState, setUsersState] = useState<LoadState<User>>(() => createInitialState<User>());

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
    const resetAll = () => {
      setArticlesState(createInitialState());
      setProgramsState(createInitialState());
      setPartnersState(createInitialState());
      setMembersState(createInitialState());
      setDonationsState(createInitialState());
      setDonationConfirmationsState(createInitialState());
      setEditorTasksState(createInitialState());
      setPickupRequestsState(createInitialState());
      setConsultationsState(createInitialState());
      setBankAccountsState(createInitialState());
      setUsersState(createInitialState());
    };

    if (!q) {
      resetAll();
      return;
    }

    let active = true;
    const term = q;
    const limit = searchLimit;
    const apiBase = `/${role}`;

    const loadArticles = async () => {
      setArticlesState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Article>>(`${apiBase}/articles`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setArticlesState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setArticlesState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil artikel." });
      }
    };

    const loadPrograms = async () => {
      setProgramsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Program>>(`${apiBase}/programs`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setProgramsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setProgramsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil program." });
      }
    };

    const loadPartners = async () => {
      setPartnersState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<Partner[]>(`${apiBase}/partners`);
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const lower = term.toLowerCase();
        const filtered = list
          .filter((p) => {
            return (
              String(p.name ?? "").toLowerCase().includes(lower) ||
              String(p.url ?? "").toLowerCase().includes(lower)
            );
          })
          .sort((a, b) => (Number(a.order ?? 0) || 0) - (Number(b.order ?? 0) || 0));
        setPartnersState({
          data: filtered.slice(0, limit),
          total: filtered.length,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setPartnersState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil mitra." });
      }
    };

    const loadMembers = async () => {
      setMembersState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<OrganizationMember>>(`${apiBase}/organization-members`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setMembersState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setMembersState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil struktur." });
      }
    };

    const loadDonations = async () => {
      setDonationsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Donation>>(`${apiBase}/donations`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setDonationsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setDonationsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil donasi." });
      }
    };

    const loadDonationConfirmations = async () => {
      setDonationConfirmationsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Donation>>(`${apiBase}/donations`, {
          params: { q: term, page: 1, per_page: limit, payment_source: "manual" },
        });
        if (!active) return;
        setDonationConfirmationsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setDonationConfirmationsState({
          data: [],
          total: 0,
          loading: false,
          error: "Gagal memuat hasil konfirmasi donasi.",
        });
      }
    };

    const loadEditorTasks = async () => {
      setEditorTasksState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<EditorTask>>(`${apiBase}/editor-tasks`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setEditorTasksState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setEditorTasksState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil tugas editor." });
      }
    };

    const loadPickupRequests = async () => {
      setPickupRequestsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<PickupRequest>>(`${apiBase}/pickup-requests`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setPickupRequestsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setPickupRequestsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil jemput wakaf." });
      }
    };

    const loadConsultations = async () => {
      setConsultationsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Consultation>>(`${apiBase}/consultations`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setConsultationsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setConsultationsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil konsultasi." });
      }
    };

    const loadUsers = async () => {
      setUsersState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<User>>(`${apiBase}/users`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setUsersState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setUsersState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil pengguna." });
      }
    };

    if (role === "admin") {
      void loadDonations();
      void loadDonationConfirmations();
      void loadEditorTasks();
      void loadPickupRequests();
      void loadConsultations();
    }

    if (role === "editor") {
      void loadArticles();
      void loadPrograms();
      void loadPartners();
      void loadMembers();
    }

    if (role === "superadmin") {
      void loadUsers();
    }

    return () => {
      active = false;
    };
  }, [q, role, searchLimit]);

  const totalResults = useMemo(() => {
    if (role === "admin") {
      return (
        donationsState.total +
        donationConfirmationsState.total +
        editorTasksState.total +
        pickupRequestsState.total +
        consultationsState.total +
        bankAccountsState.total
      );
    }
    if (role === "superadmin") {
      return usersState.total;
    }
    return articlesState.total + programsState.total + partnersState.total + membersState.total;
  }, [
    role,
    donationsState.total,
    donationConfirmationsState.total,
    editorTasksState.total,
    pickupRequestsState.total,
    consultationsState.total,
    bankAccountsState.total,
    articlesState.total,
    programsState.total,
    partnersState.total,
    membersState.total,
    usersState.total,
  ]);

  const header = headerCopy[role];
  const tagToneClass = sectionBadgeTone(header.tagTone);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="min-w-0">
          <span className={["inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1", tagToneClass].join(" ")}>
            Pencarian
          </span>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{header.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{header.description}</p>

          {q ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-primary-500 px-3 py-1 text-white ring-1 ring-primary-100">
                Kata kunci: <span className="ml-1 font-bold text-white">{q}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-brandGreen-600 px-3 py-1 text-white ring-1 ring-brandGreen-100">
                Total hasil: <span className="ml-1 font-bold">{totalResults}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {!q ? (
        <div className="rounded-[28px] border border-dashed border-brandGreen-200 bg-brandGreen-50 p-8 text-center text-sm font-semibold text-slate-700">
          Ketik kata kunci di kolom pencarian pada top bar untuk menampilkan hasil.
        </div>
      ) : (
        <div className={role === "superadmin" ? "grid gap-6" : "grid gap-6 lg:grid-cols-2"}>
          {role === "admin" && (
            <AdminSearchResults 
              donationsState={donationsState}
              donationConfirmationsState={donationConfirmationsState}
              editorTasksState={editorTasksState}
              pickupRequestsState={pickupRequestsState}
              consultationsState={consultationsState}
            />
          )}

          {role === "editor" && (
            <EditorSearchResults 
              articlesState={articlesState}
              programsState={programsState}
              partnersState={partnersState}
              membersState={membersState}
            />
          )}

          {role === "superadmin" && (
            <SuperAdminSearchResults 
              usersState={usersState}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
