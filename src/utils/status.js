export const STATUS = {
  REQUESTED: { label: "Diajukan", className: "bg-orange-100 text-orange-800", bar: "bg-orange-500" },
  REVIEWED: { label: "Ditinjau", className: "bg-yellow-100 text-yellow-800", bar: "bg-yellow-400" },
  APPROVED: { label: "Disetujui", className: "bg-emerald-100 text-emerald-800", bar: "bg-green-500" },
  PAID: { label: "Dibayar", className: "bg-sky-100 text-sky-800", bar: "bg-sky-300" },
  REJECTED: { label: "Ditolak", className: "bg-primary-100 text-primary-800" },
};

export const PRIORITY = {
  NORMAL: { label: "Normal", className: "bg-neutral-100 text-neutral-600" },
  URGENT: { label: "Urgent", className: "bg-orange-100 text-orange-800" },
  TOP_URGENT: { label: "Top Urgent", className: "bg-primary-600 text-white" },
};
