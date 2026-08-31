import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";

// Modular Components
import AdminAllocationCreateHeader from "@/components/management/admin/allocations/AdminAllocationCreateHeader";
import AdminAllocationCreateForm from "@/components/management/admin/allocations/AdminAllocationCreateForm";

// Types
import type { AllocatableProgram, AllocationFormData } from "@/types/allocation";

export function AdminAllocationCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const basePath = location.pathname.startsWith("/keuangan") ? "/keuangan" : "/admin";

  const [allocatablePrograms, setAllocatablePrograms] = useState<AllocatableProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<AllocationFormData>({
    program_id: "",
    amount: "",
    description: "",
    allocated_at: new Date().toISOString().split("T")[0],
    proof: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingPrograms(true);
    http
      .get<{ data: AllocatableProgram[] }>("/admin/allocations/allocatable-programs")
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setAllocatablePrograms(list);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat saldo program.", { title: "Gagal" });
      })
      .finally(() => {
        if (active) setLoadingPrograms(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedProgram = allocatablePrograms.find((p) => {
    if (formData.program_id === "general") return p.program_id === null;
    return String(p.program_id) === String(formData.program_id);
  }) || null;

  const maxAmount = selectedProgram ? selectedProgram.remaining_balance : 0;

  const handleProgramChange = (selectedVal: string) => {
    setFormData((prev) => ({
      ...prev,
      program_id: selectedVal,
      amount: "", // User inputs custom nominal or clicks full amount shortcut
    }));
  };

  const handleAmountChange = (val: string) => {
    const rawVal = val.replace(/\D/g, "");
    if (rawVal.length > 15) return;
    setFormData((prev) => ({ ...prev, amount: rawVal }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, proof: file }));
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, proof: null }));
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.program_id) {
      toast.error("Pilih program donasi terlebih dahulu.", { title: "Validasi Gagal" });
      return;
    }

    const amountNum = Number(formData.amount || 0);
    if (amountNum <= 0) {
      toast.error("Nominal penyaluran harus lebih dari 0.", { title: "Validasi Gagal" });
      return;
    }

    if (amountNum > maxAmount) {
      toast.error(`Nominal melebihi saldo tersedia (Maksimal: ${formatRupiah(maxAmount)})`, {
        title: "Validasi Gagal",
      });
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    if (formData.program_id !== "general" && formData.program_id !== "") {
      fd.append("program_id", formData.program_id);
    }
    fd.append("amount", formData.amount);
    if (formData.description.trim()) {
      fd.append("description", formData.description.trim());
    }
    if (formData.allocated_at) {
      fd.append("allocated_at", formData.allocated_at);
    }
    if (formData.proof) {
      fd.append("proof", formData.proof);
    }

    try {
      await http.post("/admin/allocations", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Penyaluran dana berhasil disimpan.", { title: "Berhasil" });
      navigate(`${basePath}/allocations`, { replace: true });
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      let msg = err.response?.data?.message || "Gagal menyalurkan dana.";
      if (errs && typeof errs === "object") {
        const firstErr = Object.values(errs).flat()[0];
        if (firstErr) msg = String(firstErr);
      }
      toast.error(msg, { title: "Validasi Gagal" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(num) ? num : 0);
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-6 pb-10">
      <AdminAllocationCreateHeader submitting={submitting} />

      <AdminAllocationCreateForm
        allocatablePrograms={allocatablePrograms}
        loadingPrograms={loadingPrograms}
        selectedProgram={selectedProgram}
        formData={formData}
        submitting={submitting}
        previewUrl={previewUrl}
        maxAmount={maxAmount}
        handleProgramChange={handleProgramChange}
        handleAmountChange={handleAmountChange}
        handleFileChange={handleFileChange}
        setFormData={setFormData}
        setPreviewUrl={setPreviewUrl}
        handleSubmit={handleSubmit}
        formatRupiah={formatRupiah}
      />
    </div>
  );
}

export default AdminAllocationCreatePage;
