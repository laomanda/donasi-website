export type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  allocated_at?: string | null;
  created_at: string;
  user_id?: number | null;
  donation_id?: number | null;
  user?: { name: string; email: string; phone?: string | null } | null;
  donation?: {
    id: number;
    donation_code: string;
    donor_name: string;
    donor_email?: string | null;
    donor_phone?: string | null;
    amount: number;
    program?: { title: string } | null;
  } | null;
  program?: { title: string } | null;
};

export type UserOption = {
  id: number;
  name: string;
  email: string;
  role_label: string;
};

export type AllocatableProgram = {
  program_id: number | null;
  program_title: string;
  remaining_balance: number;
};

export type AllocatablePublicDonation = {
  id: number;
  donation_code: string;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  program_id: number | null;
  program_title: string;
  amount: number;
  total_allocated: number;
  remaining_balance: number;
  is_depleted: boolean;
  paid_at: string | null;
};

export type AllocationFormData = {
  source_type: "mitra" | "public_donor";
  user_id: string;
  donation_id: string;
  program_id: string;
  amount: string;
  description: string;
  allocated_at: string;
  proof: File | null;
};
