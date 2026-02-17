import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faTrash, 
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../../lib/http";
import { toast } from "react-hot-toast";

type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  created_at: string;
  user: { name: string; email: string };
  program?: { name: string };
};

type User = {
  id: number;
  name: string;
  email: string;
  role_label: string;
};

type Program = {
  id: number;
  name: string;
};

export function AdminAllocationsPage() {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    program_id: "",
    amount: "",
    description: "",
    proof: null as File | null,
  });

  const fetchData = async () => {
    try {
      const [allocRes, usersRes, progRes] = await Promise.all([
        http.get("/admin/allocations"),
        http.get("/superadmin/users"), // Assuming we can get users here to filter mitra
        http.get("/admin/programs"),
      ]);
      setAllocations(allocRes.data.data.data);
      // Filter only Mitra role
      setUsers(usersRes.data.data.data.filter((u: any) => u.role_label?.toLowerCase() === 'mitra' || u.roles?.some((r:any) => r.name === 'mitra')));
      setPrograms(progRes.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("user_id", formData.user_id);
    data.append("program_id", formData.program_id);
    data.append("amount", formData.amount);
    data.append("description", formData.description);
    if (formData.proof) {
      data.append("proof", formData.proof);
    }

    try {
      await http.post("/admin/allocations", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Dana berhasil dialokasikan.");
      setIsModalOpen(false);
      setFormData({ user_id: "", program_id: "", amount: "", description: "", proof: null });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengalokasikan dana.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus alokasi ini? Saldo Mitra akan dikembalikan (dihitung ulang).")) return;
    try {
      await http.delete(`/admin/allocations/${id}`);
      toast.success("Alokasi dihapus.");
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus.");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Manajemen Alokasi Mitra</h1>
          <p className="text-sm text-slate-500">Kelola penggunaan dana dari Dompet Mitra.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Alokasi Baru
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs font-bold uppercase tracking-widest text-slate-500">
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Mitra</th>
              <th className="px-6 py-4">Program / Deskripsi</th>
              <th className="px-6 py-4 text-right">Nominal</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.map((alloc) => (
              <tr key={alloc.id} className="text-sm hover:bg-slate-50/30">
                <td className="px-6 py-4 text-slate-500 tabular-nums">
                  {new Date(alloc.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{alloc.user.name}</p>
                  <p className="text-xs text-slate-500">{alloc.user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{alloc.description}</p>
                  <p className="text-xs text-slate-500">{alloc.program?.name ?? "Program Umum"}</p>
                </td>
                <td className="px-6 py-4 text-right font-bold text-red-600">
                  -{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(alloc.amount)}
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center justify-center gap-2">
                      {alloc.proof_path && (
                        <a 
                          href={`http://localhost:8000/storage/${alloc.proof_path}`} 
                          target="_blank" 
                          className="p-2 text-slate-400 hover:text-slate-900 transition"
                        >
                          <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </a>
                      )}
                      <button 
                        onClick={() => handleDelete(alloc.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Alokasi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-heading text-xl font-bold text-slate-900">Alokasikan Dana Mitra</h3>
            <p className="mt-1 text-sm text-slate-500">Dana akan dikurangi dari total kontribusi lunas Mitra.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Mitra</label>
                <select
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm focus:ring-brandGreen-500 focus:outline-none"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                >
                  <option value="">-- Pilih Mitra --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Program</label>
                <select
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm focus:ring-brandGreen-500 focus:outline-none"
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                >
                  <option value="">Program Umum / Lainnya</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nominal Alokasi</label>
                <input
                  type="number"
                  required
                  placeholder="Rp..."
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm focus:ring-brandGreen-500 focus:outline-none"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Keterangan / Tujuan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Operasional Program A Tahap 1"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm focus:ring-brandGreen-500 focus:outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bukti Penggunaan (Foto/Nota)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition"
                  onChange={(e) => setFormData({ ...formData, proof: e.target.files?.[0] || null })}
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Konfirmasi Alokasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
