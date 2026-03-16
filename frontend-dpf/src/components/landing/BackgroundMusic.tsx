import { useEffect } from "react";
import { useMusic } from "../../lib/MusicContext";
import audioFile from "../../assets/brand/audio/audio.mpeg";

export function BackgroundMusic() {
  const { audioRef, setIsPlaying } = useMusic();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    let interactionListener: (() => void) | null = null;
    let isPlayAttempted = false;

    // Handle Autoplay restrictions safely
    const startAudio = async () => {
      if (isPlayAttempted) return;
      isPlayAttempted = true;
      try {
        await audio.play();
      } catch (err) {
        console.warn("Autoplay blocked. Waiting for user interaction.");
        
        interactionListener = async () => {
          try {
            await audio.play();
            if (interactionListener) {
              window.removeEventListener("click", interactionListener);
              window.removeEventListener("touchstart", interactionListener);
              interactionListener = null;
            }
          } catch (e) {
            // Silently ignore if still blocked
          }
        };

        window.addEventListener("click", interactionListener, { once: true });
        window.addEventListener("touchstart", interactionListener, { once: true });
      }
    };

    startAudio();

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      if (interactionListener) {
        window.removeEventListener("click", interactionListener);
        window.removeEventListener("touchstart", interactionListener);
      }
      audio.pause();
    };
  }, [audioRef, setIsPlaying]);

  return (
    <audio
      ref={audioRef}
      src={audioFile}
      loop
      preload="auto"
    />
  );
}
