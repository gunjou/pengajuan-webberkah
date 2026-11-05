import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDepartemen } from "../hooks/useDepartemen";

const INPUT_CLASS =
  "h-11 w-full min-w-0 appearance-none rounded-2xl bg-white/70 px-4 text-base outline-none ring-1 ring-ink/8 focus:ring-2 focus:ring-primary-500 aria-invalid:ring-2 aria-invalid:ring-primary-600 md:text-sm";

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">{label}</span>
      {children}
    </label>
  );
}

export default function RequestFilters({ list }) {
  const { filters, update, reset, dateError, activeCount } = list;
  const [text, setText] = useState(filters.search);
  const [open, setOpen] = useState(activeCount > 0);
  const departemen = useDepartemen();
  const lastSent = useRef(filters.search);

  // Tidak memanggil API di setiap ketikan.
  useEffect(() => {
    const value = text.trim();
    if (value === lastSent.current) return undefined;
    const timer = setTimeout(() => {
      lastSent.current = value;
      update({ search: value });
    }, 350);
    return () => clearTimeout(timer);
  }, [text, update]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="glass relative min-w-0 flex-1 rounded-full">
          <Search aria-hidden="true" className="pointer-events-none absolute top-3 left-4 size-5 text-neutral-500" strokeWidth={1.5} />
          <input
            type="search"
            aria-label="Cari pengajuan"
            placeholder="Cari pekerjaan atau item"
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="h-11 w-full rounded-full bg-transparent pr-11 pl-11 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {text && (
            <button
              type="button"
              aria-label="Hapus pencarian"
              onClick={() => setText("")}
              className="absolute top-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:text-ink"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-label={activeCount ? `Filter, ${activeCount} aktif` : "Filter"}
          title="Filter"
          onClick={() => setOpen((value) => !value)}
          className="glass relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-primary-600"
        >
          <SlidersHorizontal className="size-5" strokeWidth={1.5} />
          {activeCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary-700 text-[11px] font-semibold text-white"
            >
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="glass grid grid-cols-1 gap-3 rounded-3xl p-4 sm:grid-cols-3">
          <Field label="Departemen">
            <span className="relative block">
              <select
                value={filters.id_departemen}
                onChange={(event) => update({ id_departemen: event.target.value })}
                className={`${INPUT_CLASS} pr-10`}
              >
                <option value="">Semua departemen</option>
                {departemen.data?.map((row) => (
                  <option key={row.id_departemen} value={row.id_departemen}>
                    {row.nama_departemen}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-3 right-3 size-5 text-neutral-500" strokeWidth={1.5} />
            </span>
          </Field>
          <Field label="Dari tanggal">
            <input
              type="date"
              value={filters.tanggal_mulai}
              onChange={(event) => update({ tanggal_mulai: event.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Sampai tanggal">
            <input
              type="date"
              value={filters.tanggal_selesai}
              aria-invalid={Boolean(dateError)}
              onChange={(event) => update({ tanggal_selesai: event.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          {dateError && (
            <p role="alert" className="text-sm text-primary-700 sm:col-span-3">
              {dateError}
            </p>
          )}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setText("");
                lastSent.current = "";
                reset();
              }}
              className="w-fit cursor-pointer text-sm font-semibold text-primary-700 hover:underline sm:col-span-3"
            >
              Hapus semua filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
