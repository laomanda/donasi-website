export type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  created_at: string;
  user: { name: string; email: string };
  program?: { title: string };
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

export type AllocationFormData = {
  user_id: string;
  program_id: string;
  amount: string;
  description: string;
  proof: File | null;
};
