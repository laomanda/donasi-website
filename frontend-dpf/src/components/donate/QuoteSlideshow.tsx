import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
    {
        text: "Hai orang-orang yang beriman, nafkahkanlah (di jalan Allah) sebagian dari hasil usahamu yang baik-baik dan sebagian dari apa yang Kami keluarkan dari bumi untuk kamu.",
        source: "(Qs. Al Baqarah: 267)"
    },
    {
        text: "Perumpamaan (nafkah yang dikeluarkan oleh) orang-orang yang menafkahkan hartanya di jalan Allah adalah serupa dengan sebutir benih yang menumbuhkan tujuh bulir, pada tiap-puh bulir seratus biji. Allah melipat gandakan (ganjaran) bagi siapa yang Dia kehendaki.",
        source: "(Qs. Al Baqarah: 261)"
    },
    {
        text: "Sebagian besar ulama berpendapat bahwa yang dimaksud dengan hadits tersebut (sedekah jariyah) adalah Wakaf, karena sedekah jariyah adalah sedekah yang berkelanjutan manfaatnya.",
        source: ""
    }
];

export const QuoteSlideshow = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % quotes.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-24 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col gap-2"
                >
                    <p className="text-sm italic leading-relaxed text-slate-500/80">
                        "{quotes[current].text}"
                    </p>
                    {quotes[current].source && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brandGreen-600/60">
                            — {quotes[current].source}
                        </span>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
