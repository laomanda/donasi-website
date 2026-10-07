import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronDown,
  faTimes,
  faCheck,
  faPlus,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export interface SearchableSelectOption<T = string | number> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps<T = string | number> {
  id?: string;
  value: T | "" | undefined;
  onChange: (value: T) => void;
  options: SearchableSelectOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  className?: string;
  buttonClassName?: string;
  icon?: IconDefinition;
  size?: "sm" | "md";
  ariaLabel?: string;
  allowCustom?: boolean;
  customOptionLabel?: (query: string) => string;
}

export function SearchableSelect<T extends string | number = string | number>({
  id: explicitId,
  value,
  onChange,
  options,
  placeholder = "-- Pilih Opsi --",
  searchPlaceholder = "Ketik untuk mencari...",
  emptyMessage = "Tidak ada hasil yang cocok",
  disabled = false,
  clearable = false,
  onClear,
  className = "",
  buttonClassName = "",
  icon,
  size = "md",
  ariaLabel,
  allowCustom = false,
  customOptionLabel,
}: SearchableSelectProps<T>) {
  const generatedId = useId();
  const id = explicitId || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Selected option finding
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [options, value]);

  const displayLabel = useMemo(() => {
    if (selectedOption) return selectedOption.label;
    if (allowCustom && typeof value === "string" && value.trim()) {
      return value.trim();
    }
    return null;
  }, [selectedOption, allowCustom, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const labelMatch = opt.label.toLowerCase().includes(q);
      const sublabelMatch = opt.sublabel
        ? opt.sublabel.toLowerCase().includes(q)
        : false;
      const badgeMatch = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
      return labelMatch || sublabelMatch || badgeMatch;
    });
  }, [options, searchTerm]);

  const hasExactMatch = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return false;
    return options.some((opt) => opt.label.trim().toLowerCase() === q);
  }, [options, searchTerm]);

  // Reset highlight index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle click outside to close popover
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const items = listRef.current.querySelectorAll("li");
      const target = items[highlightedIndex];
      if (target) {
        target.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option: SearchableSelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (allowCustom && searchTerm.trim()) {
          onChange(searchTerm.trim() as unknown as T);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onChange("" as unknown as T);
    }
  };

  const isSmall = size === "sm";

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white text-left text-xs transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
          isSmall ? "px-2.5 py-1.5" : "px-3 py-2.5"
        } ${buttonClassName}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              className={`shrink-0 text-slate-400 group-hover:text-slate-600 ${
                isSmall ? "text-[11px]" : "text-xs"
              }`}
            />
          )}

          <div className="min-w-0 flex-1 truncate">
            {displayLabel ? (
              <span className="font-semibold text-slate-900">
                {displayLabel}
                {selectedOption?.sublabel && (
                  <span className="ml-1.5 font-normal text-slate-500 text-[11px]">
                    {selectedOption.sublabel}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex shrink-0 items-center gap-1.5 pl-1">
          {clearable && (selectedOption || (allowCustom && value)) && !disabled && (
            <span
              role="button"
              tabIndex={0}
              title="Hapus pilihan"
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
            </span>
          )}

          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-[10px] text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-slate-700" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input Box */}
          <div className="relative mb-2">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Cari opsi"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder-slate-400 transition focus:border-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-800"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                title="Hapus teks"
              >
                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
              </button>
            )}
          </div>

          {/* Options List */}
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-52 overflow-y-auto space-y-0.5 text-xs [scrollbar-width:thin]"
          >
            {allowCustom && searchTerm.trim() && !hasExactMatch && (
              <li
                role="option"
                onClick={() => {
                  onChange(searchTerm.trim() as unknown as T);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition select-none text-brandGreen-700 bg-brandGreen-50 hover:bg-brandGreen-100 font-semibold border border-dashed border-brandGreen-300 mb-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs shrink-0" />
                <span className="truncate">
                  {customOptionLabel ? customOptionLabel(searchTerm.trim()) : `Gunakan "${searchTerm.trim()}"`}
                </span>
              </li>
            )}

            {filteredOptions.length === 0 && !(allowCustom && searchTerm.trim() && !hasExactMatch) ? (
              <li className="py-4 text-center text-xs text-slate-400">
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition select-none ${
                      opt.disabled
                        ? "opacity-50 cursor-not-allowed bg-slate-50"
                        : isSelected
                        ? "bg-slate-900 text-white font-semibold"
                        : isHighlighted
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : opt.badgeColor || "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <div
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {opt.sublabel}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-xs shrink-0 text-white"
                      />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
