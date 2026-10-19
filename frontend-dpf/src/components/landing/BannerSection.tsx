import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faVolumeHigh, 
  faVolumeXmark, 
  faPlay 
} from "@fortawesome/free-solid-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import { type Banner, getImageUrl } from "./LandingUI";

export function BannerSection({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const [hasVideoStarted, setHasVideoStarted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const hasBanners = banners.length > 0;
  const slides = hasBanners ? banners : [{ id: -1, image_path: "", display_order: 0 }];

  useEffect(() => {
    setActiveIndex(0);
  }, [banners.length]);

  const handleNext = useCallback(() => {
    if (!hasBanners || banners.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % banners.length);
  }, [hasBanners, banners.length]);

  const handlePrev = useCallback(() => {
    if (!hasBanners || banners.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [hasBanners, banners.length]);

  const activeBanner = slides[activeIndex] ?? slides[0];
  const isVideo = (activeBanner?.media_type === "video" || !!activeBanner?.video_path) && !!activeBanner?.video_path;
  const isDark = hasBanners && isVideo && (isVideoPlaying || hasVideoStarted);
  const videoUrl = isVideo ? (activeBanner.video_url || (activeBanner.video_path ? getImageUrl(activeBanner.video_path) : null)) : null;
  const imageUrl = hasBanners && activeBanner?.image_path ? getImageUrl(activeBanner.image_path) : imagePlaceholder;
  const posterUrl = activeBanner?.image_path ? getImageUrl(activeBanner.image_path) : imageUrl;

  // Reset video states on slide transition
  useEffect(() => {
    setVideoError(false);
    setIsVideoPlaying(false);
    setHasVideoStarted(false);
  }, [activeIndex]);

  // Slide duration management
  useEffect(() => {
    if (!hasBanners || banners.length <= 1) return;

    let durationMs = 5000;
    if (isVideo && !videoError) {
      if (activeBanner.video_duration && activeBanner.video_duration > 0) {
        durationMs = activeBanner.video_duration * 1000;
      } else {
        durationMs = 12000; // default 12 seconds for videos
      }
    }

    const timer = window.setTimeout(() => {
      handleNext();
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [activeIndex, banners.length, hasBanners, isVideo, videoError, activeBanner?.video_duration, handleNext]);

  // Robust play attempt for mobile WebKit & desktop
  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.defaultMuted = isMuted;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsVideoPlaying(true);
          setHasVideoStarted(true);
        })
        .catch(() => {
          // Autoplay blocked by mobile browser (e.g. low power mode)
          setIsVideoPlaying(false);
        });
    }
  }, [isMuted]);

  useEffect(() => {
    if (isVideo && !videoError) {
      attemptPlay();
    }
  }, [activeIndex, isVideo, videoError, attemptPlay]);

  // Mobile swipe gestures (swipe left/right changes banner, vertical scroll allowed)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartRef.current.x;
    const diffY = endY - touchStartRef.current.y;

    // Only swipe if horizontal distance > 50px and larger than vertical distance
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartRef.current = null;
  };

  const slideVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <section
      className={`relative -mt-24 overflow-hidden select-none transition-all duration-500 ${
        isDark ? "bg-slate-950" : "bg-slate-100"
      } ${isVideo ? "pt-20 lg:pt-24" : "pt-0"}`}
    >
      <div
        className={`relative w-full mx-auto overflow-hidden flex items-center justify-center transition-all duration-500 ${
          isDark ? "bg-slate-950" : "bg-slate-100"
        } ${
          isVideo
            ? "aspect-video max-h-[calc(100svh-5rem)] lg:max-h-[calc(100svh-6rem)]"
            : "h-[100svh] min-h-[520px] lg:min-h-[600px]"
        }`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeBanner?.id ?? activeIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-colors duration-500 ${
              isDark ? "bg-slate-950" : "bg-slate-100"
            }`}
          >
            {!hasBanners ? (
              <div className="absolute inset-0 bg-slate-100 animate-pulse flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-slate-200" />
                <div className="h-4 sm:h-6 w-1/3 max-w-[300px] rounded-full bg-slate-200" />
                <div className="h-3 sm:h-4 w-1/4 max-w-[200px] rounded-full bg-slate-200/60" />
              </div>
            ) : isVideo && videoUrl && !videoError ? (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el) {
                    el.muted = isMuted;
                    el.defaultMuted = isMuted;
                  }
                }}
                key={`video-${activeBanner.id}`}
                src={videoUrl}
                poster={posterUrl}
                autoPlay
                muted={isMuted}
                playsInline
                {...({ "webkit-playsinline": "true", "x5-playsinline": "true" } as Record<string, string>)}
                preload="auto"
                onPlay={() => {
                  setIsVideoPlaying(true);
                  setHasVideoStarted(true);
                }}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={handleNext}
                onError={() => setVideoError(true)}
                onLoadedMetadata={attemptPlay}
                onCanPlay={attemptPlay}
                className="h-full w-full object-contain relative z-10"
              />
            ) : (
              <>
                <img
                  src={imageUrl}
                  onError={(e) => {
                    e.currentTarget.src = imagePlaceholder;
                  }}
                  alt="Banner"
                  width="1920"
                  height="1080"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover relative z-10"
                />
                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent" />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Fallback Play Button on Mobile if Autoplay is blocked */}
        {isVideo && videoUrl && !videoError && !isVideoPlaying && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const video = videoRef.current;
              if (video) {
                video.muted = isMuted;
                video.play().then(() => {
                  setIsVideoPlaying(true);
                  setHasVideoStarted(true);
                }).catch(() => {});
              }
            }}
            aria-label="Putar video banner"
            className="absolute inset-0 m-auto z-30 flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur-md border border-white/30 shadow-2xl hover:scale-110 active:scale-95 transition"
          >
            <FontAwesomeIcon icon={faPlay} className="text-lg sm:text-xl ml-1 text-white" />
          </button>
        )}

        {/* Sound Toggle (Only visible if active slide is a video and video has started) */}
        {isVideo && videoUrl && !videoError && hasVideoStarted && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (videoRef.current) {
                videoRef.current.muted = nextMuted;
                if (!isVideoPlaying) {
                  videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
                }
              }
            }}
            aria-label={isMuted ? "Aktifkan suara video" : "Bisukan suara video"}
            className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-slate-900 transition transform active:scale-95"
          >
            <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} className="text-xs sm:text-sm" />
          </button>
        )}
      </div>
    </section>
  );
}
