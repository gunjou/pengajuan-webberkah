import { Link } from "react-router";
import { formatRupiah, formatTanggal, isInPeriod } from "../utils/format";
import { PRIORITY } from "../utils/status";
import StatusTracker from "./StatusTracker";

function tanggalRingkas(value) {
  if (isInPeriod(value, "TODAY")) return "Hari ini";
  if (isInPeriod(value, "YESTERDAY")) return "Kemarin";
  return formatTanggal(value);
}

export default function RequestListItem({ request, showNumber = false }) {
  const urgent = request.priority !== "NORMAL";
  return (
    <Link
      to={`/pengajuan/${request.id_request}`}
      className="-mx-2 flex items-start justify-between gap-4 rounded-2xl px-2 py-3.5 transition-colors hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-primary-600"
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15px] leading-snug font-semibold">{request.nama_pekerjaan}</p>
        <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-neutral-500">
          {showNumber && <span>{request.request_number}</span>}
          <span>{tanggalRingkas(request.tanggal_request)}</span>
          {urgent && (
            <span className="font-semibold text-primary-700">
              {PRIORITY[request.priority]?.label ?? request.priority}
            </span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="text-[15px] font-semibold tabular-nums">{formatRupiah(request.total_amount)}</p>
        <StatusTracker status={request.status} />
      </div>
    </Link>
  );
}
