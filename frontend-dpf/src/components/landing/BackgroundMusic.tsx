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

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioRef, setIsPlaying]);

  return (
    <audio
      ref={audioRef}
      src={audioFile}
      loop
      preload="none"
    />
  );
}

