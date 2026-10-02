import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Account } from "@/types/finance";

interface AccountRowActionsProps {
  account: Account;
  canManage: boolean;
  onView?: (account: Account) => void;
  onEdit?: (account: Account) => void;
  onDelete: (account: Account) => void;
  layout?: "horizontal" | "stacked";
}

export const AccountRowActions: React.FC<AccountRowActionsProps> = ({
  account,
  canManage,
  onView,
  onEdit,
  onDelete,
  layout = "horizontal",
}) => {
  const detailUrl = `/finance/accounts/${account.id}`;
  const editUrl = `/finance/accounts/${account.id}/edit`;

  if (layout === "stacked") {
    return (
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Link
          to={detailUrl}
          onClick={onView ? () => onView(account) : undefined}
          aria-label={`Lihat detail akun ${account.code} ${account.name}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-brandBlueTeal-500 hover:bg-brandBlueTeal-500 hover:text-white transition active:scale-95"
        >
          <FontAwesomeIcon icon={faEye} className="text-xs" />
          <span>Detail</span>
        </Link>

        {canManage && (
          <>
            <Link
              to={editUrl}
              onClick={onEdit ? () => onEdit(account) : undefined}
              aria-label={`Ubah akun ${account.code} ${account.name}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-primary-500 hover:bg-primary-500 hover:text-white transition active:scale-95"
            >
              <FontAwesomeIcon icon={faEdit} className="text-xs" />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              onClick={() => onDelete(account)}
              aria-label={`Hapus atau nonaktifkan akun ${account.code} ${account.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs hover:border-rose-600 hover:bg-rose-600 hover:text-white transition active:scale-95"
              title="Hapus / Nonaktifkan"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={detailUrl}
        onClick={onView ? () => onView(account) : undefined}
        title="Lihat Detail"
        aria-label={`Lihat detail akun ${account.code} ${account.name}`}
        className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-brandBlueTeal-500 hover:text-white transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brandBlueTeal-500"
      >
        <FontAwesomeIcon icon={faEye} className="text-xs" />
      </Link>

      {canManage && (
        <>
          <Link
            to={editUrl}
            onClick={onEdit ? () => onEdit(account) : undefined}
            title="Edit Akun"
            aria-label={`Ubah akun ${account.code} ${account.name}`}
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-primary-500 hover:text-white transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary-500"
          >
            <FontAwesomeIcon icon={faEdit} className="text-xs" />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(account)}
            title="Hapus / Nonaktifkan"
            aria-label={`Hapus atau nonaktifkan akun ${account.code} ${account.name}`}
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-600 hover:text-white transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-rose-600"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
          </button>
        </>
      )}
    </div>
  );
};

export default AccountRowActions;
