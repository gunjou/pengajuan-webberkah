import { PRIORITY, STATUS } from "../utils/status";
import Badge from "./Badge";

export function StatusBadge({ status }) {
  const config = STATUS[status];
  return (
    <Badge className={config?.className ?? "bg-neutral-100 text-neutral-600"}>
      {config?.label ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }) {
  const config = PRIORITY[priority];
  return (
    <Badge className={config?.className ?? "bg-neutral-100 text-neutral-600"}>
      {config?.label ?? priority}
    </Badge>
  );
}
