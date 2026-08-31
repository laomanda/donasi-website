export type Allocation = {
  id: number;
  program_id?: number | null;
  amount: number;
  description: string;
  proof_path: string | null;
  allocated_at?: string | null;
  created_at: string;
  updated_at?: string | null;
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
  program?: { id: number; title: string; category?: string | null; slug?: string | null } | null;
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
  category?: string | null;
  collected_amount: number;
  total_allocated: number;
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
  program_id: string;
  amount: string;
  description: string;
  allocated_at: string;
  proof: File | null;
};
