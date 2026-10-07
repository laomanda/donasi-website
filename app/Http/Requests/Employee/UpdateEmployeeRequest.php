<?php

namespace App\Http\Requests\Employee;

use App\Models\Employee;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('slug') && is_string($this->slug) && trim($this->slug) !== '') {
            $this->merge([
                'slug' => Str::slug(trim($this->slug)),
            ]);
        }

        if ($this->has('employee_code') && is_string($this->employee_code)) {
            $this->merge([
                'employee_code' => trim($this->employee_code),
            ]);
        }

        if ($this->has('email') && is_string($this->email)) {
            $this->merge([
                'email' => strtolower(trim($this->email)),
            ]);
        }

        if ($this->has('phone') && is_string($this->phone)) {
            $this->merge([
                'phone' => trim($this->phone),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $employee = $this->route('employee');
        $employeeId = $employee instanceof Employee ? $employee->id : (int) $employee;

        return [
            'employee_code'     => ['required', 'string', 'max:50', Rule::unique('employees', 'employee_code')->ignore($employeeId)],
            'name'              => ['required', 'string', 'max:150'],
            'email'             => [
                'required',
                'string',
                'email:rfc',
                'max:150',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                Rule::unique('employees', 'email')->whereNull('deleted_at')->ignore($employeeId),
            ],
            'phone'             => [
                'required',
                'string',
                'min:9',
                'max:25',
                'regex:/^(\+?[0-9]{9,20})$/',
                Rule::unique('employees', 'phone')->whereNull('deleted_at')->ignore($employeeId),
            ],
            'slug'              => ['nullable', 'string', 'max:120', Rule::unique('employees', 'slug')->ignore($employeeId), 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'position'          => ['required', 'string', 'max:150'],
            'division'          => ['nullable', 'string', 'max:150'],
            'employment_status' => ['required', Rule::in(['active', 'inactive'])],
            'display_order'     => ['required', 'integer', 'min:1', Rule::unique('employees', 'display_order')->whereNull('deleted_at')->ignore($employeeId)],
            'is_published'      => ['required', 'boolean'],
            'id_card_image'     => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    /**
     * Custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'employee_code'     => 'ID pegawai',
            'name'              => 'nama karyawan',
            'email'             => 'alamat email',
            'phone'             => 'nomor telepon',
            'slug'              => 'slug URL',
            'position'          => 'jabatan',
            'division'          => 'divisi',
            'employment_status' => 'status karyawan',
            'display_order'     => 'urutan tampilan',
            'is_published'      => 'status publikasi',
            'id_card_image'     => 'gambar ID Card',
        ];
    }

    /**
     * Custom validation error messages in Bahasa Indonesia.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required'                  => ':Attribute wajib diisi.',
            'string'                    => ':Attribute harus berupa teks.',
            'max'                       => ':Attribute tidak boleh melebihi :max karakter.',
            'integer'                   => ':Attribute harus berupa bilangan bulat.',
            'boolean'                   => ':Attribute harus bernilai benar atau salah.',
            'employee_code.required'    => 'ID pegawai wajib diisi.',
            'employee_code.unique'      => 'ID pegawai sudah digunakan.',
            'name.required'             => 'Nama karyawan wajib diisi.',
            'email.required'            => 'Email karyawan wajib diisi.',
            'email.email'               => 'Format email tidak valid.',
            'email.regex'               => 'Format email harus valid (contoh: nama@domain.com).',
            'email.unique'              => 'Email sudah digunakan oleh karyawan lain.',
            'phone.required'            => 'Nomor telepon wajib diisi.',
            'phone.min'                 => 'Nomor telepon minimal 9 digit.',
            'phone.max'                 => 'Nomor telepon maksimal 25 digit.',
            'phone.regex'               => 'Format nomor telepon tidak valid. Gunakan angka atau format internasional (+).',
            'phone.unique'              => 'Nomor telepon sudah digunakan oleh karyawan lain.',
            'slug.unique'               => 'Slug URL sudah digunakan oleh karyawan lain.',
            'slug.regex'                => 'Format slug URL tidak valid. Gunakan huruf kecil, angka, dan tanda hubung (-).',
            'position.required'         => 'Jabatan wajib diisi.',
            'employment_status.required'=> 'Status karyawan wajib dipilih.',
            'employment_status.in'      => 'Status karyawan yang dipilih tidak valid.',
            'display_order.required'    => 'Nomor urutan tampilan wajib diisi.',
            'display_order.min'         => 'Nomor urutan tampilan minimal bernilai 1.',
            'display_order.unique'      => 'Nomor urutan tampilan sudah digunakan oleh karyawan lain.',
            'is_published.required'     => 'Status publikasi wajib ditentukan.',
            'id_card_image.image'       => 'Gambar ID Card harus berupa file gambar yang valid.',
            'id_card_image.mimes'       => 'Format gambar ID Card harus JPG, JPEG, PNG, atau WebP.',
            'id_card_image.max'         => 'Ukuran gambar ID Card melebihi batas maksimum yang diizinkan (5MB).',
        ];
    }
}
