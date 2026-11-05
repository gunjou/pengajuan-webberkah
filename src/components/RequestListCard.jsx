import Button from "./Button";
import Card from "./Card";
import RequestListItem from "./RequestListItem";

/** Isi daftar beserta keadaan memuat, gagal, dan kosong. */
export default function RequestListCard({ query, rows, emptyText, children }) {
  if (query.isPending) {
    return <div aria-busy="true" aria-label="Memuat data" className="h-80 animate-pulse rounded-card bg-white/50" />;
  }
  if (query.isError) {
    return (
      <Card className="flex flex-col items-start gap-4 p-6">
        <p className="text-sm text-neutral-600">{query.error.message}</p>
        <Button variant="light" onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? "Memuat…" : "Muat ulang"}
        </Button>
      </Card>
    );
  }
  return (
    <Card className={`p-5 transition-opacity md:p-6 ${query.isPlaceholderData ? "opacity-60" : ""}`}>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-600">{emptyText}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink/6">
          {rows.map((request) => (
            <li key={request.id_request}>
              <RequestListItem request={request} showNumber />
            </li>
          ))}
        </ul>
      )}
      {children}
    </Card>
  );
}
