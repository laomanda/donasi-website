import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadset } from "@fortawesome/free-solid-svg-icons";

type FAQ = {
  qKey: string;
  aKey: string;
};

type ServiceFaqProps = {
  faqs: FAQ[];
  badge: string;
  heading: string;
  translate: (key: string) => string;
};

export function ServiceFaq({ faqs, badge, heading, translate }: ServiceFaqProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 shadow-sm">
          <FontAwesomeIcon icon={faHeadset} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{badge}</p>
          <h2 className="text-2xl font-heading font-semibold text-slate-900">{heading}</h2>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((item, idx) => (
          <div key={item.qKey} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-soft transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700 shadow-sm ring-1 ring-primary-100">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{translate(item.qKey)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{translate(item.aKey)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
