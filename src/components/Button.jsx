import { ChevronRight } from "lucide-react";

const VARIANTS = {
  primary: "glass-primary hover:brightness-95",
  light: "glass-button text-ink hover:bg-white/80",
};

export default function Button({ variant = "primary", chevrons = false, className = "", children, ...props }) {
  return (
    <button
      className={`inline-flex h-13 cursor-pointer items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
      {chevrons && (
        <span aria-hidden="true" className="flex items-center -space-x-1.5">
          <ChevronRight className="size-5" strokeWidth={2} />
          <ChevronRight className="size-4 opacity-60" strokeWidth={2} />
          <ChevronRight className="size-3 opacity-35" strokeWidth={2} />
        </span>
      )}
    </button>
  );
}
