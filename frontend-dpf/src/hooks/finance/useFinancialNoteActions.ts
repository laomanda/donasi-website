import { useState, useCallback } from "react";
import financeService from "@/services/financeService";
import { invalidateAllFinancialNotesCache } from "@/utils/finance/financialNotesCache";
import type { FinancialNote, FinancialNotePayload } from "@/types/finance";

export interface UseFinancialNoteActionsReturn {
  submitting: boolean;
  deleting: boolean;
  createNote: (payload: FinancialNotePayload) => Promise<FinancialNote>;
  updateNote: (id: number, payload: Partial<FinancialNotePayload>) => Promise<FinancialNote>;
  deleteNote: (id: number) => Promise<void>;
}

export function useFinancialNoteActions(): UseFinancialNoteActionsReturn {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createNote = useCallback(async (payload: FinancialNotePayload): Promise<FinancialNote> => {
    setSubmitting(true);
    try {
      const res = await financeService.createFinancialNote(payload);
      const note = res.data;
      invalidateAllFinancialNotesCache(note?.id);
      return note;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updateNote = useCallback(
    async (id: number, payload: Partial<FinancialNotePayload>): Promise<FinancialNote> => {
      setSubmitting(true);
      try {
        const res = await financeService.updateFinancialNote(id, payload);
        const note = res.data;
        invalidateAllFinancialNotesCache(id);
        return note;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const deleteNote = useCallback(async (id: number): Promise<void> => {
    setDeleting(true);
    try {
      await financeService.deleteFinancialNote(id);
      invalidateAllFinancialNotesCache(id);
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    submitting,
    deleting,
    createNote,
    updateNote,
    deleteNote,
  };
}
