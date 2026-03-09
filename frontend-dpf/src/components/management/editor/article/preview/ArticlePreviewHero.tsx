import { imagePlaceholder } from "@/lib/placeholder";

type Props = {
  thumbnailUrl: string;
  title: string;
};

export default function ArticlePreviewHero({ thumbnailUrl, title }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-slate-100 shadow-soft">
      <img
        src={thumbnailUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
        onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
      />
      <img
        src={thumbnailUrl}
        alt={title}
        className="relative z-10 h-[260px] w-full object-contain sm:h-[340px]"
        onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
      />
    </div>
  );
}
