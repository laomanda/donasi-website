interface ImportWorkflowProps {
  currentStep: number;
}

export function ImportWorkflow({ currentStep }: ImportWorkflowProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <div
          className={`flex items-center gap-3 rounded-xl p-2.5 ${
            currentStep >= 1 ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
              currentStep >= 1 ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            1
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Unduh Template</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">Format .xlsx resmi</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl p-2.5 ${
            currentStep >= 2 ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
              currentStep >= 2 ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            2
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Pilih & Upload</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">Pilih berkas Excel</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl p-2.5 ${
            currentStep >= 3 ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
              currentStep >= 4
                ? "bg-emerald-600 text-white"
                : currentStep === 3
                ? "bg-rose-600 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            3
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Preview & Validasi</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">Cek integritas data</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl p-2.5 ${
            currentStep >= 4 ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
              currentStep === 5 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            4
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Konfirmasi Import</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">Posting ke database</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportWorkflow;
