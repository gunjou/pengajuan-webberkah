import { useEffect, useRef } from "react";

/** Dialog native: fokus terkunci di dalam, dan tombol Esc menutupnya. */
export default function Dialog({ label, onClose, className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector("[data-autofocus]")?.focus();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`glass m-auto rounded-card text-ink backdrop:bg-ink/30 backdrop:backdrop-blur-sm ${className}`}
    >
      {children}
    </dialog>
  );
}
