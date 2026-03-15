import { useEffect, useMemo, useState } from "react";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../../lib/bulk";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";

// Modular Components
import { RolesHeader } from "../../../../components/management/superadmin/access/RolesHeader";
import { RolesFilter } from "../../../../components/management/superadmin/access/RolesFilter";
import { RolesTable } from "../../../../components/management/superadmin/access/RolesTable";
import { RolesMobileList } from "../../../../components/management/superadmin/access/RolesMobileList";

type Permission = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  name: string;
  users_count?: number;
  permissions?: Permission[];
  updated_at?: string | null;
  created_at?: string | null;
};

export function RolesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  const selection = useBulkSelection<number>();
  
  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!q.trim()) return items;
    const query = q.toLowerCase();
    return items.filter(r => r.name.toLowerCase().includes(query));
  }, [items, q]);

  const pageIds = useMemo(() => filteredItems.map((r) => r.id), [filteredItems]);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Role[]>("/superadmin/roles");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Gagal memuat daftar role.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoles();
  }, []);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const onResetFilters = () => {
    setQ("");
  };


  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    
    const coreRoles = ['superadmin', 'admin', 'editor', 'mitra'];
    const selectedToDestroy = items.filter(r => 
        selection.isSelected(r.id) && !coreRoles.includes(r.name.toLowerCase())
    );

    if (selectedToDestroy.length === 0) {
        toast.error("Tidak ada role yang dapat dihapus (Role utama sistem diproteksi).");
        return;
    }

    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selectedToDestroy.map(r => r.id), 4, async (id) => {
        await http.delete(`/superadmin/roles/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, {
          title: "Sebagian gagal",
        });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} role.`, { title: "Berhasil" });
        selection.clear();
      }

      void fetchRoles();
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      <RolesHeader />

      <RolesFilter
        q={q}
        setQ={setQ}
        onReset={onResetFilters}
      />

      {error ? (
        <div className="rounded-[24px] border border-red-100 bg-red-50 p-6 flex items-center gap-4 text-red-700 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">!</div>
          <p className="font-bold uppercase tracking-tight">{error}</p>
        </div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="role"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <RolesTable
          items={filteredItems}
          loading={loading}
          selection={selection}
          pageIds={pageIds}
        />

        <RolesMobileList
          items={filteredItems}
          loading={loading}
          selection={selection}
        />

        <div className="border-t border-slate-100 bg-slate-50/50 p-6">
          <p className="text-sm font-semibold text-slate-500 text-center sm:text-left">
            Menampilkan {filteredItems.length} dari {items.length} role terdaftar.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RolesPage;
