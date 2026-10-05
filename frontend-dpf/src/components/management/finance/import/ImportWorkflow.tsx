interface ImportWorkflowProps {
  currentStep: number;
}

const STEPS = ["Pilih File", "Validasi", "Tinjau", "Konfirmasi", "Selesai"];

export function ImportWorkflow({ currentStep }: ImportWorkflowProps) {
  const activeIndex = Math.min(Math.max(currentStep, 1), STEPS.length) - 1;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs sm:px-5">
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STEPS.map((label, index) => {
          const completed = index < activeIndex;
          const current = index === activeIndex;
          return (
            <div key={label} className="flex min-w-max flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${completed ? "bg-brandGreen-500 text-white" : current ? "bg-primary-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {completed ? "✓" : index + 1}
                </span>
                <span className={`text-xs font-bold ${current ? "text-slate-900" : "text-slate-500"}`}>{label}</span>
              </div>
              {index < STEPS.length - 1 && <span className={`h-px min-w-5 flex-1 ${completed ? "bg-brandGreen-500" : "bg-slate-300"}`} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ImportWorkflow;
