// Segmented control ala iOS
export default function Tabs({ items, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex w-full overflow-x-auto rounded-full bg-ink/6 p-1 [scrollbar-width:none] md:w-fit">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.value)}
            className={`h-9 flex-auto cursor-pointer rounded-full px-2 text-[13px] whitespace-nowrap max-[359px]:px-1 max-[359px]:text-xs font-medium transition md:flex-none md:px-5 ${
              active ? "bg-white text-ink shadow-sm" : "text-neutral-600 hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
