import { useEffect } from "react";
import { useMusic } from "../../lib/MusicContext";
import audioFile from "../../assets/brand/audio/audio.mpeg";

export function BackgroundMusic() {
  const { audioRef } = useMusic();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Handle Autoplay restrictions
    const startAudio = async () => {
      try {
        await audio.play();
        console.log("BackgroundMusic: Playback started automatically");
      } catch (err) {
        console.warn("Autoplay blocked. Waiting for user interaction. Error:", err);
        
        const handleFirstInteraction = async () => {
          try {
            await audio.play();
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("touchstart", handleFirstInteraction);
          } catch (e) {
            console.error("Playback failed even after interaction:", e);
          }
        };

        window.addEventListener("click", handleFirstInteraction);
        window.addEventListener("touchstart", handleFirstInteraction);
      }
    };

    startAudio();

    return () => {
      // Audio is managed globally, but we might want to pause if the component unmounts 
      // (which only happens on dashboard routes in App.tsx)
      audio.pause();
    };
  }, [audioRef]);

  return (
    <audio
      ref={audioRef}
      src={audioFile}
      loop
      preload="auto"
    />
  );
}
