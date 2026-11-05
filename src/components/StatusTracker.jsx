import { STATUS } from "../utils/status";

const STAGES = ["REQUESTED", "REVIEWED", "APPROVED", "PAID"];

/** Penanda empat tahap; tahap yang sudah dilalui terisi merah. */
export default function StatusTracker({ status }) {
  const current = STAGES.indexOf(status);
  return (
    <span className="flex items-center gap-2">
      <span className="text-xs font-medium text-neutral-600">{STATUS[status]?.label ?? status}</span>
      <span aria-hidden="true" className="flex gap-0.5">
        {STAGES.map((stage, index) => (
          <span
            key={stage}
            className={`h-1.5 w-3 rounded-full ${index <= current ? STATUS[status].bar : "bg-ink/10"}`}
          />
        ))}
      </span>
    </span>
  );
}
