import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";

// Modular Components
import AdminAllocationCreateHeader from "@/components/management/admin/allocations/AdminAllocationCreateHeader";
import AdminAllocationCreateForm from "@/components/management/admin/allocations/AdminAllocationCreateForm";

// Types
import type { UserOption, AllocatableProgram, AllocationFormData } from "@/types/allocation";

export function AdminAllocationCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [allocatablePrograms, setAllocatablePrograms] = useState<AllocatableProgram[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<AllocationFormData>({
    user_id: "",
    program_id: "",
    amount: "",
    description: "",
    proof: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await http.get("/admin/users", { params: { role: "mitra", per_page: 100 } });
        setUsers(data.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data mitra.");
      }
    };
    void fetchData();
  }, []);

  const handleUserChange = async (userId: string) => {
    setFormData((prev) => ({ ...prev, user_id: userId, program_id: "", amount: "" }));
    setAllocatablePrograms([]);

    if (!userId) return;

    const loadingToastId = toast.info("Mengecek saldo program...", { durationMs: 0 });
    try {
      const { data } = await http.get(`/admin/users/${userId}/allocatable-programs`);
      setAllocatablePrograms(data.data || []);
      toast.dismiss(loadingToastId);

      if (data.data.length === 0) {
        toast.error("Mitra ini belum memiliki saldo donasi yang bisa dialokasikan.", { durationMs: 5000 });
      } else {
        toast.success(`Ditemukan ${data.data.length} program dengan saldo.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat saldo program.");
      toast.dismiss(loadingToastId);
    }
  };

  const getSelectedProgramBalance = () => {
    if (!formData.program_id && formData.program_id !== "") return 0;
    const prog = allocatablePrograms.find((p) => String(p.program_id ?? "") === String(formData.program_id));
    return prog ? prog.remaining_balance : 0;
  };

  const maxAmount = getSelectedProgramBalance();

  const handleAmountChange = (val: string) => {
    const rawVal = val.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, amount: rawVal }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, proof: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setFormData((prev) => ({ ...prev, proof: null }));
      setPreviewUrl(null);
    }
  };

  const handleProgramChange = (selectedProgId: string) => {
    const prog = allocatablePrograms.find((p) => String(p.program_id ?? "") === String(selectedProgId));
    const max = prog ? prog.remaining_balance : "";
    setFormData((prev) => ({ ...prev, program_id: selectedProgId, amount: String(max) }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (Number(formData.amount) > maxAmount) {
      toast.error(`Nominal melebihi saldo tersedia (Maks: ${formatRupiah(maxAmount)})`);
      return;
    }

    if (!formData.proof) {
      toast.error("Bukti penggunaan wajib diunggah.");
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append("user_id", formData.user_id);
    if (formData.program_id) {
      data.append("program_id", formData.program_id);
    }
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
      navigate("/admin/allocations");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengalokasikan dana.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-6">
      <AdminAllocationCreateHeader submitting={submitting} />

      <AdminAllocationCreateForm
        users={users}
        allocatablePrograms={allocatablePrograms}
        formData={formData}
        submitting={submitting}
        previewUrl={previewUrl}
        maxAmount={maxAmount}
        handleUserChange={handleUserChange}
        handleAmountChange={handleAmountChange}
        handleFileChange={handleFileChange}
        handleProgramChange={handleProgramChange}
        setFormData={setFormData}
        setPreviewUrl={setPreviewUrl}
        handleSubmit={handleSubmit}
        formatRupiah={formatRupiah}
      />
    </div>
  );
}

export default AdminAllocationCreatePage;
