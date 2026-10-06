import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/ToastProvider';
import type { AxiosError } from 'axios';
import employeeService from '@/services/employeeService';
import type { EmployeeFormErrors, EmployeeFormPayload } from '@/types/employee';
import { useEmployeeFilters } from '@/hooks/employees/useEmployeeFilters';
import { EmployeeForm } from '@/components/management/employees';

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { filters: filterOptions } = useEmployeeFilters();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<EmployeeFormErrors>({});

  const handleSubmit = async (payload: EmployeeFormPayload) => {
    setSubmitting(true);
    setServerErrors({});

    try {
      const created = await employeeService.createEmployee(payload);
      toast.success('Karyawan berhasil ditambahkan.');
      navigate(`/employees/${created.id}`);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      if (axiosErr?.response?.status === 422 && axiosErr.response?.data?.errors) {
        const rawErrors = axiosErr.response.data.errors;
        const mappedErrors: EmployeeFormErrors = {};
        Object.entries(rawErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            mappedErrors[field as keyof EmployeeFormErrors] = messages[0];
          }
        });
        setServerErrors(mappedErrors);
        toast.error('Periksa kembali isian formulir.');
      } else {
        const msg = axiosErr?.response?.data?.message || 'Gagal menambahkan karyawan.';
        setServerErrors({ general: msg });
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 animate-fade-in font-body">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Kembali ke Daftar Karyawan</span>
        </Link>
        <h1 className="font-poppins text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Tambah Karyawan
        </h1>
        <p className="text-sm text-slate-600">
          Lengkapi data identitas, status organisasi, dan unggah ID Card digital untuk karyawan baru.
        </p>
      </div>

      {/* Shared Reusable Form */}
      <EmployeeForm
        mode="create"
        filterOptions={filterOptions}
        submitting={submitting}
        serverErrors={serverErrors}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employees')}
      />
    </div>
  );
}

export default EmployeeCreatePage;
