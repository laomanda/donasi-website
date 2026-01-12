type WaveDividerProps = {
  className?: string;
  flipY?: boolean;
  /** class Tailwind buat warna fill, contoh: "fill-slate-50" / "fill-white" / "fill-primary-50" */
  fillClassName?: string;
  /** class Tailwind buat warna stroke, contoh: "stroke-slate-200/70" */
  strokeClassName?: string;
  strokeWidth?: number;
};

export function WaveDivider({
  className = "",
  flipY = false,
  fillClassName = "fill-white",
  strokeClassName,
  strokeWidth,
}: WaveDividerProps) {
  const pathClassName = [fillClassName, strokeClassName].filter(Boolean).join(" ");
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`}>
      <svg
        className={`block h-[46px] w-[calc(100%+1.3px)] ${
          flipY ? "rotate-180" : ""
        }`}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31.93,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3.5V120H0V95.8C57.44,118.92,141.5,90.79,216.56,75.57,268.94,64.93,319.06,58.28,321.39,56.44Z"
          className={pathClassName}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
