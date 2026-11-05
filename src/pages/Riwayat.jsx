import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import IconButton from "../components/IconButton";
import RequestFilters from "../components/RequestFilters";
import RequestListCard from "../components/RequestListCard";
import { useListFilters } from "../hooks/useListFilters";
import { usePurchaseRequestHistory } from "../hooks/usePurchaseRequests";

const PER_PAGE = 10;

export default function Riwayat() {
  const list = useListFilters();
  const { page, update } = list;
  const query = usePurchaseRequestHistory(
    { status: "PAID", page, per_page: PER_PAGE, ...list.filters },
    { enabled: !list.dateError },
  );
  const rows = query.data?.data ?? [];
  const info = query.data?.page_info;

  // Halaman di URL melebihi data yang ada, mis. tautan lama.
  useEffect(() => {
    if (info && !query.isPlaceholderData && info.total_pages > 0 && page > info.total_pages) {
      update({ page: info.total_pages });
    }
  }, [info, page, query.isPlaceholderData, update]);

  const goTo = (next) => {
    update({ page: next === 1 ? "" : next });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="pt-1 text-2xl font-semibold tracking-tight md:pt-3 md:text-3xl">Riwayat dibayar</h1>
      <RequestFilters list={list} />
      {!list.dateError && (
        <>
          {info && <p className="px-1 text-sm text-neutral-600">{info.total} pengajuan dibayar</p>}
          <RequestListCard query={query} rows={rows} emptyText="Belum ada pengajuan dibayar yang cocok.">
            {info?.total_pages > 1 && (
              <nav aria-label="Halaman" className="mt-3 flex items-center justify-between gap-3 border-t border-ink/6 pt-4">
                <IconButton
                  icon={ChevronLeft}
                  label="Halaman sebelumnya"
                  disabled={info.page <= 1 || query.isPlaceholderData}
                  onClick={() => goTo(info.page - 1)}
                  className="disabled:cursor-not-allowed disabled:opacity-40"
                />
                <p className="text-sm text-neutral-600 tabular-nums">
                  Halaman {info.page} dari {info.total_pages}
                </p>
                <IconButton
                  icon={ChevronRight}
                  label="Halaman berikutnya"
                  disabled={info.page >= info.total_pages || query.isPlaceholderData}
                  onClick={() => goTo(info.page + 1)}
                  className="disabled:cursor-not-allowed disabled:opacity-40"
                />
              </nav>
            )}
          </RequestListCard>
        </>
      )}
    </div>
  );
}
