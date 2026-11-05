import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

const isDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return false;
  const date = new Date(+match[1], +match[2] - 1, +match[3]);
  return date.getMonth() === +match[2] - 1 && date.getDate() === +match[3];
};

/**
 * Filter disimpan di URL agar bertahan saat kembali dari halaman detail.
 * Nilai dari URL dibersihkan dulu: backend menjawab 500 untuk tanggal atau angka yang salah.
 */
export function useListFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const departemen = params.get("id_departemen");
    const mulai = params.get("tanggal_mulai");
    const selesai = params.get("tanggal_selesai");
    return {
      search: params.get("search") ?? "",
      id_departemen: /^\d+$/.test(departemen ?? "") ? departemen : "",
      tanggal_mulai: isDate(mulai) ? mulai : "",
      tanggal_selesai: isDate(selesai) ? selesai : "",
    };
  }, [params]);

  const page = /^[1-9]\d{0,5}$/.test(params.get("page") ?? "") ? Number(params.get("page")) : 1;

  const update = useCallback(
    (changes) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          // Hasil berubah, jadi halaman kembali ke awal kecuali halamannya sendiri yang diganti.
          if (!("page" in changes)) next.delete("page");
          Object.entries(changes).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined) next.delete(key);
            else next.set(key, value);
          });
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const dateError =
    filters.tanggal_mulai && filters.tanggal_selesai && filters.tanggal_mulai > filters.tanggal_selesai
      ? "Tanggal selesai tidak boleh sebelum tanggal mulai."
      : "";

  const activeCount =
    (filters.id_departemen ? 1 : 0) + (filters.tanggal_mulai ? 1 : 0) + (filters.tanggal_selesai ? 1 : 0);

  const reset = useCallback(
    () => update({ search: "", id_departemen: "", tanggal_mulai: "", tanggal_selesai: "" }),
    [update],
  );

  return { filters, page, params, update, reset, dateError, activeCount };
}
