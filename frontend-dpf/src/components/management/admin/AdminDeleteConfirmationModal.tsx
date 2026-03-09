import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner, faTrashAlt, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

type AdminDeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
  itemName?: string;
};

export default function AdminDeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini secara permanen?",
  loading = false,
  itemName,
}: AdminDeleteConfirmationModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white text-left align-middle shadow-2xl transition-all border border-slate-100">
                {/* Header Style as Danger Zone */}
                <div className="flex items-center justify-between border-b border-rose-50 bg-rose-50/50 px-8 py-6">
                  <Dialog.Title
                    as="h3"
                    className="flex items-center gap-3 text-lg font-bold leading-6 text-rose-900"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </div>
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-8">
                  <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 mb-6">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mt-1 text-amber-500" />
                    <p className="text-xs font-semibold leading-relaxed">
                      Tindakan ini bersifat permanen dan data tidak dapat dipulihkan kembali.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">
                      {description}
                    </p>
                    {itemName && (
                      <p className="text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100 break-all">
                        "{itemName}"
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex order-2 sm:order-1 items-center justify-center rounded-2xl bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                      disabled={loading}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={onConfirm}
                      className="inline-flex order-1 sm:order-2 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        "Ya, Hapus Permanen"
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
