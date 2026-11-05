import RequestFilters from "../components/RequestFilters";
import RequestListCard from "../components/RequestListCard";
import Tabs from "../components/Tabs";
import { useListFilters } from "../hooks/useListFilters";
import { usePurchaseRequests } from "../hooks/usePurchaseRequests";

// Pengajuan yang sudah dibayar ada di halaman Riwayat.
const STATUSES = [
  { value: "ACTIVE", label: "Berjalan" },
  { value: "REQUESTED", label: "Diajukan" },
  { value: "REVIEWED", label: "Ditinjau" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
];

export default function Pengajuan() {
  const list = useListFilters();
  const rawStatus = list.params.get("status");
  const status = STATUSES.some((item) => item.value === rawStatus) ? rawStatus : "ACTIVE";
  const query = usePurchaseRequests({ status, ...list.filters }, { enabled: !list.dateError });
  const rows = query.data ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="pt-1 text-2xl font-semibold tracking-tight md:pt-3 md:text-3xl">Pengajuan</h1>
      <RequestFilters list={list} />
      <Tabs
        label="Saring status"
        items={STATUSES}
        value={status}
        onChange={(value) => list.update({ status: value === "ACTIVE" ? "" : value })}
      />
      {!list.dateError && (
        <>
          {query.isSuccess && <p className="px-1 text-sm text-neutral-600">{rows.length} pengajuan</p>}
          <RequestListCard query={query} rows={rows} emptyText="Tidak ada pengajuan yang cocok." />
        </>
      )}
    </div>
  );
}
