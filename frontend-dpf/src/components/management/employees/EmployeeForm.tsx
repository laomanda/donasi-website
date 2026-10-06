import React, { useState, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faTriangleExclamation,
  faXmark,
  faIdBadge,
  faSitemap,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import type {
  Employee,
  EmployeeFilterOptions,
  EmployeeFormErrors,
  EmployeeFormPayload,
  EmploymentStatus,
} from '@/types/employee';

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  initialData?: Employee | null;
  filterOptions: EmployeeFilterOptions;
  submitting: boolean;
  serverErrors?: EmployeeFormErrors;
  onSubmit: (payload: EmployeeFormPayload) => Promise<void>;
  onCancel?: () => void;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  mode,
  initialData,
  filterOptions,
  submitting,
  serverErrors = {},
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const datalistPosId = useId();
  const datalistDivId = useId();

  // Form State
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('active');
  const [displayOrder, setDisplayOrder] = useState<string>('1');
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // ID Card Image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Client validation errors
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  // Populate data in edit mode
  useEffect(() => {
    if (initialData) {
      setEmployeeCode(initialData.employee_code ?? '');
      setName(initialData.name ?? '');
      setSlug(initialData.slug ?? '');
      setPosition(initialData.position ?? '');
      setDivision(initialData.division ?? '');
      setEmploymentStatus(initialData.employment_status ?? 'active');
      setDisplayOrder(
        initialData.display_order !== null && initialData.display_order !== undefined
          ? String(initialData.display_order)
          : ''
      );
      setIsPublished(Boolean(initialData.is_published));
    }
  }, [initialData]);

  // Handle local image file preview
  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setFilePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setClientErrors((prev) => ({
        ...prev,
        id_card_image: 'Format gambar ID Card harus JPG, JPEG, PNG, atau WebP.',
      }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setClientErrors((prev) => ({
        ...prev,
        id_card_image: 'Ukuran gambar ID Card melebihi batas maksimum 5 MB.',
      }));
      return;
    }

    setClientErrors((prev) => {
      const next = { ...prev };
      delete next.id_card_image;
      return next;
    });

    setSelectedFile(file);
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
  };

  const isSlugChangedOnEdit =
    mode === 'edit' &&
    initialData &&
    slug.trim() !== '' &&
    slug.trim() !== initialData.slug;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client preliminary checks
    const errors: Record<string, string> = {};
    if (!employeeCode.trim()) {
      errors.employee_code = 'ID pegawai wajib diisi.';
    }
    if (!name.trim()) {
      errors.name = 'Nama karyawan wajib diisi.';
    }
    if (!position.trim()) {
      errors.position = 'Jabatan wajib diisi.';
    }
    const orderNum = parseInt(displayOrder, 10);
    if (!displayOrder || isNaN(orderNum) || orderNum < 1) {
      errors.display_order = 'Nomor urutan tampilan harus bilangan bulat positif (minimal 1).';
    }
    if (mode === 'create' && !selectedFile) {
      errors.id_card_image = 'Gambar ID Card wajib diunggah saat menambahkan karyawan baru.';
    }

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setClientErrors({});

    const payload: EmployeeFormPayload = {
      employee_code: employeeCode.trim(),
      name: name.trim(),
      slug: slug.trim() || undefined,
      position: position.trim(),
      division: division.trim() || undefined,
      employment_status: employmentStatus,
      display_order: orderNum,
      is_published: isPublished,
      id_card_image: selectedFile ?? undefined,
    };

    await onSubmit(payload);
  };

  // Merge server and client errors
  const getFieldError = (field: keyof EmployeeFormErrors) => {
    return clientErrors[field] || serverErrors[field];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION A: IDENTITAS KARYAWAN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FontAwesomeIcon icon={faIdBadge} className="text-sm" />
          </div>
          <div>
            <h2 className="font-poppins text-base font-bold text-slate-900">
              A. Identitas Karyawan
            </h2>
            <p className="text-xs text-slate-500">
              Informasi dasar identitas dan slug unik untuk URL profil digital.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* ID Pegawai */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              ID Pegawai <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="Contoh: 0108026"
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-2xs transition focus:outline-hidden focus:ring-2 ${
                getFieldError('employee_code')
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
              }`}
            />
            {getFieldError('employee_code') ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {getFieldError('employee_code')}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Format teks unik. Digit nol di awal (misal: 0108026) akan dipertahankan.
              </p>
            )}
          </div>

          {/* Nama Karyawan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nama Karyawan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap karyawan"
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition focus:outline-hidden focus:ring-2 ${
                getFieldError('name')
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
              }`}
            />
            {getFieldError('name') && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {getFieldError('name')}
              </p>
            )}
          </div>

          {/* Slug URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Slug URL <span className="text-[11px] font-normal lowercase text-slate-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="jakkob-panjaitan"
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-2xs transition focus:outline-hidden focus:ring-2 ${
                getFieldError('slug')
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
              }`}
            />
            {getFieldError('slug') ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {getFieldError('slug')}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                {mode === 'create'
                  ? 'Kosongkan jika ingin slug dibuat otomatis dari nama karyawan.'
                  : 'Slug menentukan alamat URL profil publik karyawan.'}
              </p>
            )}

            {/* Warning if slug changed on edit */}
            {isSlugChangedOnEdit && (
              <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-amber-600" />
                <p>
                  <strong>Perhatian:</strong> Mengubah slug akan mengubah URL publik karyawan. QR atau tautan fisik lama yang sudah menggunakan URL sebelumnya dapat berhenti berfungsi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION B: ORGANISASI & STATUS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FontAwesomeIcon icon={faSitemap} className="text-sm" />
          </div>
          <div>
            <h2 className="font-poppins text-base font-bold text-slate-900">
              B. Organisasi & Status
            </h2>
            <p className="text-xs text-slate-500">
              Penetapan jabatan, divisi kerja, urutan visual, dan status penugasan.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Jabatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Jabatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list={datalistPosId}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Contoh: Web Developer"
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition focus:outline-hidden focus:ring-2 ${
                getFieldError('position')
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
              }`}
            />
            <datalist id={datalistPosId}>
              {filterOptions.positions.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            {getFieldError('position') ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {getFieldError('position')}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Pilih dari saran yang sudah ada atau ketik nama jabatan baru.
              </p>
            )}
          </div>

          {/* Divisi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Divisi <span className="text-[11px] font-normal lowercase text-slate-400">(opsional)</span>
            </label>
            <input
              type="text"
              list={datalistDivId}
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="Contoh: Teknologi Informasi"
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition focus:outline-hidden focus:ring-2 ${
                getFieldError('division')
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
              }`}
            />
            <datalist id={datalistDivId}>
              {filterOptions.divisions.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
            {getFieldError('division') && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {getFieldError('division')}
              </p>
            )}
          </div>

          {/* Status Karyawan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status Karyawan <span className="text-rose-500">*</span>
            </label>
            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition focus:outline-hidden focus:ring-2 ${
                getFieldError('employment_status')
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
              }`}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
            {getFieldError('employment_status') && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {getFieldError('employment_status')}
              </p>
            )}
          </div>

          {/* Urutan Tampilan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Urutan Tampilan <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="1"
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-2xs transition focus:outline-hidden focus:ring-2 ${
                getFieldError('display_order')
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
              }`}
            />
            {getFieldError('display_order') ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {getFieldError('display_order')}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Nomor menentukan urutan karyawan pada direktori publik. Harus unik di antara karyawan aktif.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION C: ID CARD DIGITAL & PUBLIKASI */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FontAwesomeIcon icon={faImage} className="text-sm" />
          </div>
          <div>
            <h2 className="font-poppins text-base font-bold text-slate-900">
              C. ID Card Digital & Publikasi
            </h2>
            <p className="text-xs text-slate-500">
              Unggah berkas visual ID Card utuh dan atur visibilitas halaman publik.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Upload & Toggle column */}
          <div className="space-y-6 lg:col-span-7">
            {/* File upload input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Gambar ID Card {mode === 'create' && <span className="text-rose-500">*</span>}
              </label>

              <div className="mt-2 flex flex-col gap-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-4 text-center text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100/60">
                  <FontAwesomeIcon icon={faUpload} className="text-slate-500" />
                  <span>{selectedFile ? 'Ganti Berkas Gambar' : 'Pilih Gambar ID Card'}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {selectedFile && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveSelectedFile}
                      className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      aria-label="Batalkan pilihan file"
                    >
                      <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                  </div>
                )}
              </div>

              {getFieldError('id_card_image') ? (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {getFieldError('id_card_image')}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Format yang didukung: JPG, JPEG, PNG, WebP. Maksimal 5 MB. ID Card berupa berkas visual portrait lengkap.
                </p>
              )}
            </div>

            {/* Publication Toggle */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-500"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-900">
                    Tampilkan di Halaman Publik
                  </span>
                  <p className="text-xs text-slate-500">
                    Karyawan yang disembunyikan tidak dapat diakses melalui direktori atau tautan publik.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ID Card Visual Preview column */}
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pratinjau ID Card
            </label>

            <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-2xs">
              {filePreviewUrl ? (
                <div className="relative max-h-[380px] w-full overflow-hidden rounded-lg bg-white shadow-xs">
                  <img
                    src={filePreviewUrl}
                    alt="Pratinjau ID Card yang dipilih"
                    className="mx-auto max-h-[380px] w-auto object-contain"
                  />
                  <div className="absolute bottom-2 left-2 right-2 rounded-md bg-slate-900/80 px-2 py-1 text-center text-[11px] font-semibold text-white">
                    Berkas Baru Dipilih
                  </div>
                </div>
              ) : initialData?.id_card_image_url ? (
                <div className="relative max-h-[380px] w-full overflow-hidden rounded-lg bg-white shadow-xs">
                  <img
                    src={initialData.id_card_image_url}
                    alt={`ID Card digital ${initialData.name}`}
                    className="mx-auto max-h-[380px] w-auto object-contain"
                  />
                  <div className="absolute bottom-2 left-2 right-2 rounded-md bg-slate-900/80 px-2 py-1 text-center text-[11px] font-semibold text-white">
                    ID Card Tersimpan Saat Ini
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 space-y-1 py-8">
                  <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-300" />
                  <p>Belum ada gambar ID Card yang dipilih.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Form Error if any */}
      {serverErrors.general && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <span>{serverErrors.general}</span>
        </div>
      )}

      {/* SUBMIT & ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              navigate('/employees');
            }
          }}
          disabled={submitting}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-[#ff8a00] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#e67c00] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Menyimpan...' : mode === 'create' ? 'Simpan Karyawan' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};
