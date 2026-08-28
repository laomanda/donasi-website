import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";

// Modular Components
import AdminAllocationCreateHeader from "@/components/management/admin/allocations/AdminAllocationCreateHeader";
import AdminAllocationCreateForm from "@/components/management/admin/allocations/AdminAllocationCreateForm";

// Types
import type { UserOption, AllocatableProgram, AllocatablePublicDonation, AllocationFormData } from "@/types/allocation";

export function AdminAllocationCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [allocatablePrograms, setAllocatablePrograms] = useState<AllocatableProgram[]>([]);
  const [publicDonations, setPublicDonations] = useState<AllocatablePublicDonation[]>([]);
  const [includeDepleted, setIncludeDepleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<AllocationFormData>({
    source_type: "mitra",
    user_id: "",
    donation_id: "",
    program_id: "",
    amount: "",
    description: "",
    allocated_at: new Date().toISOString().split("T")[0],
    proof: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await http.get("/admin/users", { params: { role: "mitra", per_page: 100 } });
        setUsers(data.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data mitra.", { title: "Gagal" });
      }
    };

    void fetchUsers();
  }, []);

  const fetchPublicDonations = async (showDepleted = includeDepleted) => {
    try {
      const { data } = await http.get("/admin/allocations/allocatable-public-donations", {
        params: { include_depleted: showDepleted ? 1 : 0 }
      });
      setPublicDonations(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data donasi publik.", { title: "Gagal" });
    }
  };

  useEffect(() => {
    if (formData.source_type === "public_donor") {
      void fetchPublicDonations(includeDepleted);
    }
  }, [formData.source_type, includeDepleted]);

  const handleSourceTypeChange = (type: "mitra" | "public_donor") => {
    setFormData((prev) => ({
      ...prev,
      source_type: type,
      user_id: "",
      donation_id: "",
      program_id: "",
      amount: "",
    }));
    setAllocatablePrograms([]);
  };

  const handleUserChange = async (userId: string) => {
    setFormData((prev) => ({ ...prev, user_id: userId, program_id: "", amount: "" }));
    setAllocatablePrograms([]);

    if (!userId) return;

    const loadingToastId = toast.info("Mengecek saldo program...", {
        title: "Informasi",
        durationMs: 0 });
    try {
      const { data } = await http.get(`/admin/users/${userId}/allocatable-programs`);
      setAllocatablePrograms(data.data || []);
      toast.dismiss(loadingToastId);

      if (data.data.length === 0) {
        toast.error("Mitra ini belum memiliki saldo donasi yang bisa disalurkan.", {
            title: "Gagal",
            durationMs: 5000 });
      } else {
        toast.success(`Ditemukan ${data.data.length} program dengan saldo.`, { title: "Berhasil" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat saldo program.", { title: "Gagal" });
      toast.dismiss(loadingToastId);
    }
  };

  const handleDonationChange = (donationId: string) => {
    const selected = publicDonations.find((d) => String(d.id) === String(donationId));
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        donation_id: donationId,
        program_id: selected.program_id ? String(selected.program_id) : "",
        amount: String(selected.remaining_balance),
      }));
    } else {
      setFormData((prev) => ({ ...prev, donation_id: "", program_id: "", amount: "" }));
    }
  };

  const getSelectedBalance = () => {
    if (formData.source_type === "mitra") {
      if (!formData.program_id && formData.program_id !== "") return 0;
      const prog = allocatablePrograms.find((p) => String(p.program_id ?? "") === String(formData.program_id));
      return prog ? prog.remaining_balance : 0;
    } else {
      const donation = publicDonations.find((d) => String(d.id) === String(formData.donation_id));
      return donation ? donation.remaining_balance : 0;
    }
  };

  const maxAmount = getSelectedBalance();

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

    if (formData.source_type === "mitra" && !formData.user_id) {
      toast.error("Pilih mitra terdaftar terlebih dahulu.", { title: "Gagal" });
      return;
    }

    if (formData.source_type === "public_donor" && !formData.donation_id) {
      toast.error("Pilih transaksi donasi publik terlebih dahulu.", { title: "Gagal" });
      return;
    }

    if (Number(formData.amount) <= 0) {
      toast.error("Nominal penyaluran harus lebih dari 0.", { title: "Gagal" });
      return;
    }

    if (Number(formData.amount) > maxAmount) {
      toast.error(`Nominal melebihi saldo tersedia (Maks: ${formatRupiah(maxAmount)})`, { title: "Gagal" });
      return;
    }

    if (!formData.proof) {
      toast.error("Bukti penggunaan wajib diunggah.", { title: "Gagal" });
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    if (formData.source_type === "mitra") {
      data.append("user_id", formData.user_id);
    } else {
      data.append("donation_id", formData.donation_id);
    }

    if (formData.program_id) {
      data.append("program_id", formData.program_id);
    }
    data.append("amount", formData.amount);
    data.append("description", formData.description);
    if (formData.allocated_at) {
      data.append("allocated_at", formData.allocated_at);
    }
    if (formData.proof) {
      data.append("proof", formData.proof);
    }

    try {
      await http.post("/admin/allocations", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Penyaluran dana berhasil disimpan.", { title: "Berhasil" });
      navigate("/admin/allocations");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyalurkan dana.", { title: "Gagal" });
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
        publicDonations={publicDonations}
        includeDepleted={includeDepleted}
        setIncludeDepleted={setIncludeDepleted}
        formData={formData}
        submitting={submitting}
        previewUrl={previewUrl}
        maxAmount={maxAmount}
        handleSourceTypeChange={handleSourceTypeChange}
        handleUserChange={handleUserChange}
        handleDonationChange={handleDonationChange}
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
