import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useMusic } from "../../../lib/MusicContext";

interface MusicToggleProps {
  className?: string;
}

export function MusicToggle({ className }: MusicToggleProps) {
  const { isPlaying, togglePlay } = useMusic();

  return (
    <button
      type="button"
      onClick={togglePlay}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 ${className}`}
      aria-label={isPlaying ? "Mute music" : "Play music"}
    >
      <FontAwesomeIcon icon={isPlaying ? faMusic : faVolumeMute} />
      
      {isPlaying && (
        <motion.span
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-current -z-10"
        />
      )}
    </button>
  );
}
