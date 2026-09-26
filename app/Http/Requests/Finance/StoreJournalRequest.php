<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_date'            => ['required', 'date'],
            'accounting_period_id'        => ['nullable', 'exists:accounting_periods,id'],
            'description'                 => ['required', 'string', 'max:1000'],
            'reference_type'              => ['nullable', 'string', 'max:50'],
            'reference_id'                => ['nullable', 'integer'],
            'program_id'                  => ['nullable', 'exists:programs,id'],
            'status'                      => ['nullable', 'in:draft,posted'],
            'journal_lines'               => ['required', 'array', 'min:2'],
            'journal_lines.*.account_id'  => ['required', 'exists:accounts,id'],
            'journal_lines.*.debit'       => ['required', 'numeric', 'min:0'],
            'journal_lines.*.credit'      => ['required', 'numeric', 'min:0'],
            'journal_lines.*.description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_date.required'           => 'Tanggal transaksi wajib diisi.',
            'description.required'                => 'Keterangan jurnal wajib diisi.',
            'journal_lines.required'              => 'Rincian baris jurnal wajib diisi.',
            'journal_lines.min'                   => 'Jurnal minimal harus memiliki 2 baris (Debit & Kredit).',
            'journal_lines.*.account_id.required' => 'Akun (account_id) pada setiap baris wajib dipilih.',
            'journal_lines.*.account_id.exists'   => 'Akun yang dipilih tidak valid atau tidak terdaftar di COA.',
            'journal_lines.*.debit.required'      => 'Nominal debit wajib diisi (minimal 0).',
            'journal_lines.*.credit.required'     => 'Nominal kredit wajib diisi (minimal 0).',
        ];
    }
}
