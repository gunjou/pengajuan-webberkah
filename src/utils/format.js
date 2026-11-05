const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatRupiah = (value) => rupiahFormatter.format(Number(value) || 0);

/** "YYYY-MM-DD" dibaca sebagai tanggal lokal agar tidak bergeser karena zona waktu. */
export function formatTanggal(value) {
  if (!value) return "-";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3])
    : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

export const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Mencocokkan "YYYY-MM-DD" dengan periode: ALL, TODAY, YESTERDAY, atau WEEK (Senin–Minggu). */
export function isInPeriod(value, period, now = new Date()) {
  if (period === "ALL") return true;
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  if (period === "TODAY") return value === toDateKey(now);
  if (period === "YESTERDAY") return value === toDateKey(new Date(y, m, d - 1));
  if (period === "WEEK") {
    const monday = d - ((now.getDay() + 6) % 7);
    return value >= toDateKey(new Date(y, m, monday)) && value <= toDateKey(new Date(y, m, monday + 6));
  }
  return false;
}

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTanggalWaktu(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateTimeFormatter.format(date);
}

export const formatJumlah = (value) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(Number(value) || 0);
