import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Step = {
  titleKey: string;
  descKey: string;
  icon: any;
};

type ServiceStepsProps = {
  steps: Step[];
  badge: string;
  heading: string;
  translate: (key: string) => string;
  icon: any;
  cols?: number;
  id?: string;
};

export function ServiceSteps({ steps, badge, heading, translate, icon, cols = 5, id }: ServiceStepsProps) {
  const gridColsClass = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  }[cols as 3 | 4 | 5] || "lg:grid-cols-5";

  return (
    <section id={id} className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 shadow-sm">
            <FontAwesomeIcon icon={icon} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brandGreen-700">{badge}</p>
            <h2 className="text-2xl font-heading font-semibold text-slate-900">{heading}</h2>
          </div>
        </div>

        <div className={`mt-10 grid gap-6 sm:grid-cols-2 ${gridColsClass} items-stretch`}>
          {steps.map((step, idx) => (
            <div
              key={step.titleKey}
              className="group relative flex h-full flex-col rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
            >
              {/* Number Watermark Effect */}
              <div className="absolute -right-2 -top-2 h-16 w-16 rotate-12 rounded-full bg-gradient-to-br from-primary-50 to-white opacity-50 blur-xl transition-all group-hover:opacity-100 group-hover:blur-2xl" />
              
              <div className="relative mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-600 transition-colors group-hover:bg-brandGreen-600 group-hover:text-white shadow-sm">
                  <FontAwesomeIcon icon={step.icon} className="text-lg" />
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-xs font-bold text-slate-400 ring-1 ring-slate-100 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:ring-primary-100">
                  {idx + 1}
                </span>
              </div>
              
              <h3 className="min-h-[3rem] text-base font-heading font-bold text-slate-800 leading-tight group-hover:text-brandGreen-700 transition-colors">
                {translate(step.titleKey)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {translate(step.descKey)}
              </p>
              
              {/* Connective Line (Only for large screens and not the last item) */}
              {idx < steps.length - 1 && (
                <div className="pointer-events-none absolute inset-y-0 right-2 hidden w-px bg-gradient-to-b from-transparent via-slate-100 to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
