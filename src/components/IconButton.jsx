export default function IconButton({ icon: Icon, label, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex size-11 cursor-pointer items-center justify-center glass rounded-full text-ink transition-transform active:scale-95 ${className}`}
      {...props}
    >
      <Icon className="size-5" strokeWidth={1.5} />
    </button>
  );
}
