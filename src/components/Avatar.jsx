import { useState } from "react";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

/** Foto profil; jika tidak ada atau gagal dimuat, tampil inisial nama. */
export default function Avatar({ name, src, className = "size-11 text-sm" }) {
  const [failed, setFailed] = useState(false);
  const base = `glass flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-primary-700 ${className}`;

  if (src && !failed) {
    return (
      <span className={base}>
        <img src={src} alt="" onError={() => setFailed(true)} className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={base}>
      {initials(name)}
    </span>
  );
}
