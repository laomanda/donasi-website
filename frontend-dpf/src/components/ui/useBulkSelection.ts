import { useMemo, useState } from "react";

export function useBulkSelection<TId extends string | number>() {
  const [selected, setSelected] = useState<Set<TId>>(() => new Set());

  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const count = selected.size;

  const isSelected = (id: TId) => selected.has(id);

  const toggle = (id: TId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clear = () => setSelected(new Set());

  const addMany = (ids: TId[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const removeMany = (ids: TId[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleAll = (ids: TId[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.length > 0 && ids.every((id) => next.has(id));
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const keepOnly = (ids: TId[]) => {
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const allowed = new Set(ids);
      const next = new Set<TId>();
      prev.forEach((id) => {
        if (allowed.has(id)) next.add(id);
      });
      return next;
    });
  };

  return {
    selected,
    selectedIds,
    count,
    isSelected,
    toggle,
    clear,
    addMany,
    removeMany,
    toggleAll,
    keepOnly,
    setSelected,
  };
}

