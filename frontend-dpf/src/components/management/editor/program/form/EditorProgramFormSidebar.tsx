import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { type ProgramFormState } from "../EditorProgramTypes";
import { FormLabel } from "../EditorProgramUI";

type Props = {
    form: ProgramFormState;
    onChange: (updates: Partial<ProgramFormState>) => void;
    availableCategories: { category: string; category_en: string | null }[];
    loading?: boolean;
    saving?: boolean;
    deleting?: boolean;
};

export default function EditorProgramFormSidebar({ 
    form, 
    onChange, 
    availableCategories, 
    loading, 
    saving, 
    deleting 
}: Props) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const disabled = loading || saving || deleting;

    const filteredCategories = availableCategories.filter((cat) =>
        cat.category.toLowerCase().includes(form.category.toLowerCase())
    );

    const handleCategoryChange = (val: string) => {
        const existing = availableCategories.find(
            (c) => c.category.toLowerCase() === val.toLowerCase()
        );

        onChange({
            category: val,
            category_en: existing ? (existing.category_en ?? "") : form.category_en,
        });
    };

    const handleSelectCategory = (cat: { category: string; category_en: string | null }) => {
        onChange({
            category: cat.category,
            category_en: cat.category_en ?? "",
        });
        setShowDropdown(false);
    };

    const isExistingCategory = availableCategories.some(
        (c) => c.category.toLowerCase() === form.category.trim().toLowerCase()
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:h-fit">
            <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Properti</p>

                <div className="mt-5 space-y-4">
                    <label className="block">
                        <FormLabel label="Status Publikasi" required />
                        <select
                            value={form.status}
                            onChange={(e) => onChange({ status: e.target.value as any })}
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                            disabled={disabled}
                        >
                            <option value="draft">Draf</option>
                            <option value="active">Berjalan</option>
                            <option value="completed">Tersalurkan</option>
                        </select>
                    </label>

                    <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                        <div className="relative" ref={dropdownRef}>
                            <label className="block">
                                <FormLabel label="Kategori (Bahasa Indonesia)" required />
                                <div className="relative mt-2">
                                    <input
                                        value={form.category}
                                        onChange={(e) => {
                                            handleCategoryChange(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onClick={() => setShowDropdown(true)}
                                        placeholder="Ketik atau pilih kategori..."
                                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                        disabled={disabled}
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                                        <FontAwesomeIcon 
                                            icon={faChevronDown} 
                                            className={`text-[10px] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
                                        />
                                    </div>
                                </div>
                            </label>

                            {showDropdown && filteredCategories.length > 0 && (
                                <div className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    {filteredCategories.map((cat, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectCategory(cat)}
                                            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brandGreen-600"
                                        >
                                            <span>{cat.category}</span>
                                            {cat.category_en && <span className="text-[10px] font-medium text-slate-400 italic">({cat.category_en})</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label className="block">
                            <FormLabel label="Kategori (Bahasa Inggris)" optional />
                            <input
                                value={form.category_en}
                                onChange={(e) => onChange({ category_en: e.target.value })}
                                placeholder={isExistingCategory ? "Otomatis terisi" : "Terjemahan Inggris..."}
                                className={`mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brandGreen-400 ${
                                    isExistingCategory ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white text-slate-900"
                                }`}
                                disabled={disabled || isExistingCategory}
                            />
                            {isExistingCategory && (
                                <p className="mt-1 text-[10px] font-semibold text-brandGreen-600">Terjemahan terkunci karena kategori sudah ada.</p>
                            )}
                        </label>
                    </div>

                    <label className="block">
                        <FormLabel label="Slug / URL" optional subLabel="Biarkan kosong untuk generate otomatis." />
                        <input
                            value={form.slug}
                            onChange={(e) => onChange({ slug: e.target.value })}
                            placeholder="judul-program-anda"
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                            disabled={disabled}
                        />
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block">
                            <FormLabel label="Target Donasi (IDR)" required />
                            <input
                                type="number"
                                value={form.target_amount}
                                onChange={(e) => onChange({ target_amount: e.target.value })}
                                placeholder="10000000"
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                disabled={disabled}
                            />
                        </label>
                        <label className="block">
                            <FormLabel label="Batas Hari" optional />
                            <input
                                type="number"
                                value={form.deadline_days}
                                onChange={(e) => onChange({ deadline_days: e.target.value })}
                                placeholder="30"
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                disabled={disabled}
                            />
                        </label>
                    </div>

                    <label className="block">
                        <FormLabel label="Tanggal Publikasi" optional />
                        <input
                            type="datetime-local"
                            value={form.published_at ? form.published_at.slice(0, 16) : ""}
                            onChange={(e) => onChange({ published_at: e.target.value })}
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                            disabled={disabled}
                        />
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={form.is_highlight}
                            onChange={(e) => onChange({ is_highlight: e.target.checked })}
                            className="h-5 w-5 rounded-lg border-slate-300 text-brandGreen-600 focus:ring-brandGreen-400 transition"
                            disabled={disabled}
                        />
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition">Highlight Program</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
