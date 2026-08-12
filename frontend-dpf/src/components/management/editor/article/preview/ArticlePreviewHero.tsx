import { imagePlaceholder } from "@/lib/placeholder";

type Props = {
  thumbnailUrl: string;
  videoUrl?: string;
  title: string;
};

export default function ArticlePreviewHero({ thumbnailUrl, videoUrl, title }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-slate-100 shadow-soft">
      {/* Background Blur Effect (only for image, not video) */}
      {!videoUrl && (
        <img
          src={thumbnailUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
        />
      )}

      {videoUrl ? (
        <div className="relative z-10 flex h-[260px] w-full items-center justify-center bg-black sm:h-[340px]">
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
            poster={thumbnailUrl !== imagePlaceholder ? thumbnailUrl : undefined}
          />
        </div>
      ) : (
        <img
          src={thumbnailUrl}
          alt={title}
          className="relative z-10 h-[260px] w-full object-contain sm:h-[340px]"
          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
        />
      )}
    </div>
  );
}
