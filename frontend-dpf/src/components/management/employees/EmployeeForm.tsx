import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faTriangleExclamation,
  faXmark,
  faIdBadge,
  faSitemap,
  faImage,
  faCheck,
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

  // Form State
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [position, setPosition] = useState<string>('');
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

  const parsedDisplayOrder = parseInt(displayOrder, 10);
  const isDuplicateDisplayOrder =
    Number.isInteger(parsedDisplayOrder) &&
    filterOptions.display_orders.includes(parsedDisplayOrder) &&
    parsedDisplayOrder !== initialData?.display_order;

  useEffect(() => {
    if (mode !== 'create' || !filterOptions.display_orders?.length) return;

    const currentOrder = parseInt(displayOrder, 10);
    const currentIsUsed = Number.isInteger(currentOrder) &&
      filterOptions.display_orders.includes(currentOrder);

    if (!displayOrder.trim() || currentIsUsed) {
      let nextOrder = 1;
      while (filterOptions.display_orders.includes(nextOrder)) nextOrder += 1;
      setDisplayOrder(String(nextOrder));
    }
  }, [displayOrder, filterOptions.display_orders, mode]);
  const displayOrderError = isDuplicateDisplayOrder
    ? 'Nomor urutan ini sudah digunakan oleh karyawan lain.'
    : clientErrors.display_order || serverErrors.display_order;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client preliminary checks
    const errors: Record<string, string> = {};

    if (!employeeCode.trim()) {
      errors.employee_code = 'ID Pegawai wajib diisi.';
    }

    if (!name.trim()) {
      errors.name = 'Nama karyawan wajib diisi.';
    }

    if (!position.trim()) {
      errors.position = 'Jabatan wajib diisi.';
    }

    const parsedOrder = parseInt(displayOrder, 10);
    if (!displayOrder.trim() || isNaN(parsedOrder) || parsedOrder < 1 || isDuplicateDisplayOrder) {
      errors.display_order = 'Urutan tampilan harus berupa bilangan bulat positif minimal 1.';
    }

    if (mode === 'create' && !selectedFile) {
      errors.id_card_image = 'Gambar ID Card wajib diunggah pada penambahan karyawan baru.';
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
      employment_status: employmentStatus,
      display_order: parsedOrder,
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      {/* SECTION A: IDENTITAS KARYAWAN */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandPurple-500 bg-white p-5 shadow-sm sm:p-7 space-y-5 lg:col-span-7">
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brandPurple-500 text-white">
            <FontAwesomeIcon icon={faIdBadge} className="text-base" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              A. Identitas Karyawan
            </h2>
            <p className="text-xs text-slate-500">
              Informasi dasar identitas dan slug unik untuk URL profil digital.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* ID Pegawai */}
          <div>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                ID Pegawai <span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="Contoh: 0108026"
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
                  getFieldError('employee_code')
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-slate-400 focus:ring-brandGreen-400'
                }`}
              />
            </label>
            {getFieldError('employee_code') ? (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {getFieldError('employee_code')}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                Format teks unik. Digit nol di awal (misal: 0108026) akan dipertahankan.
              </p>
            )}
          </div>

          {/* Nama Karyawan */}
          <div>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Nama Karyawan <span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap karyawan"
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
                  getFieldError('name')
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-slate-400 focus:ring-brandGreen-400'
                }`}
              />
            </label>
            {getFieldError('name') && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {getFieldError('name')}
              </p>
            )}
          </div>

          {/* Slug URL */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Slug URL <span className="text-[11px] font-normal lowercase text-slate-400">(opsional)</span>
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="jakkob-panjaitan"
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
                  getFieldError('slug')
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-slate-400 focus:ring-brandGreen-400'
                }`}
              />
            </label>
            {getFieldError('slug') ? (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {getFieldError('slug')}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                {mode === 'create'
                  ? 'Kosongkan jika ingin slug dibuat otomatis dari nama karyawan.'
                  : 'Slug menentukan alamat URL profil publik karyawan.'}
              </p>
            )}

            {/* Warning if slug changed on edit */}
            {isSlugChangedOnEdit && (
              <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-amber-600 text-sm" />
                <p>
                  <strong className="font-bold">Perhatian:</strong> Mengubah slug akan mengubah URL publik karyawan. QR atau tautan fisik lama yang sudah menggunakan URL sebelumnya dapat berhenti berfungsi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION B: ORGANISASI & STATUS */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandBlueTeal-500 bg-white p-5 shadow-sm sm:p-7 space-y-5 lg:col-span-5">
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brandBlueTeal-500 text-white">
            <FontAwesomeIcon icon={faSitemap} className="text-base" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              B. Organisasi & Status
            </h2>
            <p className="text-xs text-slate-500">
              Penetapan jabatan, urutan visual, dan status penugasan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Jabatan */}
          <div>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Jabatan <span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Contoh: Web Developer"
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
                  getFieldError('position')
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-slate-400 focus:ring-brandGreen-400'
                }`}
              />
            </label>
            {getFieldError('position') ? (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {getFieldError('position')}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                Pilih dari saran yang sudah ada atau ketik nama jabatan baru.
              </p>
            )}

            {/* Quick suggestion chips for Jabatan */}
            {filterOptions.positions.length > 0 && (
              <div className="mt-2.5 max-h-24 overflow-y-auto rounded-2xl bg-white p-2">
                <div className="flex flex-wrap gap-1.5">
                {filterOptions.positions
                  .filter((posOption) => {
                    const query = position.trim().toLowerCase();
                    return !query || posOption.toLowerCase().includes(query);
                  })
                  .map((posOption) => {
                  const isSelected = position.trim().toLowerCase() === posOption.trim().toLowerCase();
                  return (
                    <button
                      key={posOption}
                      type="button"
                      onClick={() => setPosition(posOption)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-brandGreen-600 text-white font-bold'
                          : 'bg-slate-600 text-white hover:bg-slate-700'
                      }`}
                    >
                      {posOption}
                    </button>
                  );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Status Karyawan */}
          <div>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Status Karyawan <span className="text-rose-500">*</span>
              </span>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </label>
            <p className="mt-1.5 text-[11px] font-medium text-slate-400">
              Karyawan nonaktif tetap tercatat namun dapat disembunyikan.
            </p>
          </div>

          {/* Urutan Tampilan */}
          <div className="md:col-span-2 md:mx-auto md:w-1/2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Urutan Tampilan <span className="text-rose-500">*</span>
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="1"
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
                    displayOrderError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-slate-400 focus:ring-brandGreen-400'
                }`}
              />
            </label>
            {displayOrderError ? (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {displayOrderError}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                Nomor menentukan urutan karyawan pada direktori publik.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION C: ID CARD DIGITAL & PUBLIKASI */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandWarmOrange-500 bg-white p-5 shadow-sm sm:p-7 space-y-5 lg:col-span-12">
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brandWarmOrange-500 text-white">
            <FontAwesomeIcon icon={faImage} className="text-base" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              C. ID Card Digital & Publikasi
            </h2>
            <p className="text-xs text-slate-500">
              Unggah file gambar kartu ID Card digital fisik lengkap dan atur visibilitas publik.
            </p>
          </div>
        </div>

        {/* Publication Switch */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label htmlFor="pub-switch" className="text-sm font-bold text-slate-900 cursor-pointer">
                Tampilkan di Halaman Publik
              </label>
              <p className="text-xs text-slate-500">
                {isPublished
                  ? 'Karyawan akan dapat diakses publik melalui direktori dan pemindaian QR.'
                  : 'Karyawan yang disembunyikan tidak dapat diakses melalui halaman publik.'}
              </p>
            </div>

            <button
              id="pub-switch"
              type="button"
              role="switch"
              aria-checked={isPublished}
              onClick={() => setIsPublished((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brandGreen-400 ${
                isPublished ? 'bg-brandGreen-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isPublished ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ID Card Image Upload & Preview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* File input area */}
          <div className="lg:col-span-7 space-y-4">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Gambar ID Card {mode === 'create' ? <span className="text-rose-500">*</span> : null}
              </span>
              <p className="mt-1 text-xs text-slate-500">
                Pilih berkas ID Card portrait lengkap (bukan foto profil avatar). Format: JPG, JPEG, PNG, WebP (maks. 5 MB).
              </p>
            </label>

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 transition hover:bg-slate-50 text-center">
              <input
                type="file"
                id="id-card-file-input"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="id-card-file-input"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400"
              >
                <FontAwesomeIcon icon={faUpload} className="text-slate-500 text-xs" />
                <span>Pilih Gambar ID Card</span>
              </label>

              {selectedFile && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left">
                  <div className="min-w-0 flex-1 truncate pr-2">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveSelectedFile}
                    className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition"
                    title="Hapus pilihan berkas"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                  </button>
                </div>
              )}
            </div>

            {getFieldError('id_card_image') && (
              <p className="text-xs font-semibold text-rose-600">
                {getFieldError('id_card_image')}
              </p>
            )}
          </div>

          {/* ID Card Preview */}
          <div className="lg:col-span-5">
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Pratinjau ID Card
            </span>
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
              {filePreviewUrl ? (
                <div className="text-center space-y-2">
                  <img
                    src={filePreviewUrl}
                    alt="Pratinjau ID Card baru"
                    className="max-h-64 w-auto max-w-full rounded-xl object-contain shadow-md mx-auto"
                  />
                  <span className="inline-block rounded-full bg-brandGreen-600 px-3 py-1 text-[10px] font-bold text-white">
                    File Baru Dipilih
                  </span>
                </div>
              ) : mode === 'edit' && initialData?.id_card_image_url ? (
                <div className="text-center space-y-2">
                  <img
                    src={initialData.id_card_image_url}
                    alt={`ID Card digital ${initialData.name}`}
                    className="max-h-64 w-auto max-w-full rounded-xl object-contain shadow-md mx-auto"
                  />
                  <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-[10px] font-bold text-slate-700">
                    ID Card Saat Ini
                  </span>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 py-8">
                  <FontAwesomeIcon icon={faIdBadge} className="text-3xl text-slate-300 mb-2" />
                  <p>Belum ada gambar yang dipilih</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* General Error Banner */}
      {serverErrors.general && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-3 lg:col-span-12">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-rose-500 text-sm" />
          <span>{serverErrors.general}</span>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center lg:col-span-12">
        <button
          type="button"
          onClick={onCancel || (() => navigate('/employees'))}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={submitting || isDuplicateDisplayOrder}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-[0.99] disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faCheck} className="text-xs" />
          <span>
            {submitting
              ? 'Menyimpan...'
              : mode === 'create'
              ? 'Simpan Karyawan'
              : 'Simpan Perubahan'}
          </span>
        </button>
      </div>
    </form>
  );
};
