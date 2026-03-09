import { useRef, useEffect } from "react";
import { type ProgramFormState } from "../EditorProgramTypes";
import { autoResizeTextarea } from "../EditorProgramUtils";
import { FormLabel } from "../EditorProgramUI";

type Props = {
    form: ProgramFormState;
    onChange: (updates: Partial<ProgramFormState>) => void;
    disabled?: boolean;
};

export default function EditorProgramFormMain({ form, onChange, disabled }: Props) {
    const shortDescRef = useRef<HTMLTextAreaElement>(null);
    const shortDescEnRef = useRef<HTMLTextAreaElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const descEnRef = useRef<HTMLTextAreaElement>(null);
    const benefitsRef = useRef<HTMLTextAreaElement>(null);
    const benefitsEnRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { autoResizeTextarea(shortDescRef.current); }, [form.short_description]);
    useEffect(() => { autoResizeTextarea(shortDescEnRef.current); }, [form.short_description_en]);
    useEffect(() => { autoResizeTextarea(descRef.current); }, [form.description]);
    useEffect(() => { autoResizeTextarea(descEnRef.current); }, [form.description_en]);
    useEffect(() => { autoResizeTextarea(benefitsRef.current); }, [form.benefits]);
    useEffect(() => { autoResizeTextarea(benefitsEnRef.current); }, [form.benefits_en]);

    return (
        <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8 space-y-6">
            <div className="grid grid-cols-1 gap-4">
                <label className="block">
                    <FormLabel label="Judul (Bahasa Indonesia)" required />
                    <input
                        value={form.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="Tulis judul program yang jelas."
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        disabled={disabled}
                    />
                </label>

                <label className="block">
                    <FormLabel label="Judul (Bahasa Inggris)" optional />
                    <input
                        value={form.title_en}
                        onChange={(e) => onChange({ title_en: e.target.value })}
                        placeholder="Terjemahan judul program (opsional)."
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        disabled={disabled}
                    />
                </label>

                <label className="block">
                    <FormLabel label="Ringkasan (Bahasa Indonesia)" required />
                    <textarea
                        ref={shortDescRef}
                        value={form.short_description}
                        onChange={(e) => onChange({ short_description: e.target.value })}
                        rows={3}
                        placeholder="Ringkasan singkat yang tampil di kartu program."
                        className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        disabled={disabled}
                    />
                </label>

                <label className="block">
                    <FormLabel label="Ringkasan (Bahasa Inggris)" optional />
                    <textarea
                        ref={shortDescEnRef}
                        value={form.short_description_en}
                        onChange={(e) => onChange({ short_description_en: e.target.value })}
                        rows={3}
                        placeholder="Terjemahan ringkasan (opsional)."
                        className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        disabled={disabled}
                    />
                </label>

                <label className="block">
                    <FormLabel label="Deskripsi (Bahasa Indonesia)" required />
                    <textarea
                        ref={descRef}
                        value={form.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        rows={12}
                        placeholder="Jelaskan tujuan program, alur penyaluran, dan informasi penting lainnya."
                        className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        disabled={disabled}
                    />
                </label>

                <label className="block">
                    <FormLabel label="Deskripsi (Bahasa Inggris)" optional />
                    <textarea
                        ref={descEnRef}
                        value={form.description_en}
                        onChange={(e) => onChange({ description_en: e.target.value })}
                        rows={12}
                        placeholder="Terjemahan deskripsi program (opsional)."
                        className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        disabled={disabled}
                    />
                </label>

                <label className="block">
                    <FormLabel label="Manfaat (Bahasa Indonesia)" optional />
                    <textarea
                        ref={benefitsRef}
                        value={form.benefits}
                        onChange={(e) => onChange({ benefits: e.target.value })}
                        rows={4}
                        placeholder="Tuliskan manfaat utama, boleh per baris."
                        className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        disabled={disabled}
                    />
                </label>

                <label className="block">
                    <FormLabel label="Manfaat (Bahasa Inggris)" optional />
                    <textarea
                        ref={benefitsEnRef}
                        value={form.benefits_en}
                        onChange={(e) => onChange({ benefits_en: e.target.value })}
                        rows={4}
                        placeholder="Terjemahan manfaat (opsional)."
                        className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        disabled={disabled}
                    />
                </label>
            </div>
        </div>
    );
}
