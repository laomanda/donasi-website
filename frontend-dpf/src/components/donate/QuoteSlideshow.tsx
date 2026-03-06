import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../../lib/i18n";
import { donateDict } from "./DonateI18n";
import { translate } from "../../lib/i18n-utils";

export const QuoteSlideshow = () => {
    const { locale } = useLang();
    const [current, setCurrent] = useState(0);

    const quotes = useMemo(() => [
        {
            text: translate(donateDict, locale, "donate.quotes.1.text"),
            source: translate(donateDict, locale, "donate.quotes.1.source")
        },
        {
            text: translate(donateDict, locale, "donate.quotes.2.text"),
            source: translate(donateDict, locale, "donate.quotes.2.source")
        },
        {
            text: translate(donateDict, locale, "donate.quotes.3.text"),
            source: translate(donateDict, locale, "donate.quotes.3.source")
        },
        {
            text: translate(donateDict, locale, "donate.quotes.4.text"),
            source: translate(donateDict, locale, "donate.quotes.4.source")
        }
    ], [locale]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % quotes.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [quotes.length]);

    return (
        <div className="relative h-24 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${current}-${locale}`}
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
