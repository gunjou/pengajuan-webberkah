import { LogOut, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Card from "../components/Card";
import IconButton from "../components/IconButton";
import RequestListItem from "../components/RequestListItem";
import Tabs from "../components/Tabs";
import ThemePicker from "../components/ThemePicker";
import { useMySummary } from "../hooks/usePurchaseRequests";
import { useProfile } from "../hooks/useProfile";
import { isInPeriod } from "../utils/format";
import { STATUS } from "../utils/status";

const MAX_ITEMS = 5;

const PERIODS = [
  { value: "TODAY", label: "Hari ini" },
  { value: "YESTERDAY", label: "Kemarin" },
  { value: "WEEK", label: "Minggu ini" },
];

const todayLabel = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

function greeting(hour = new Date().getHours()) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function Skeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat data"
      className="flex flex-col gap-5"
    >
      <div className="h-52 animate-pulse rounded-card bg-white/50" />
      <div className="h-72 animate-pulse rounded-card bg-white/50" />
    </div>
  );
}

function SummaryPanel({ summary }) {
  // summary.active ikut menghitung REJECTED, jadi "berjalan" dihitung dari tiga tahap ini.
  const stages = [
    {
      label: "Diajukan",
      value: summary.requested,
      color: STATUS.REQUESTED.bar,
    },
    { label: "Ditinjau", value: summary.reviewed, color: STATUS.REVIEWED.bar },
    { label: "Disetujui", value: summary.approved, color: STATUS.APPROVED.bar },
  ];
  const total = stages.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <Card className="p-5 md:p-6">
      <p className="text-sm text-neutral-600">{todayLabel}</p>
      <p className="mt-1 mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
        {total > 0
          ? `${total} pengajuan berjalan`
          : "Tidak ada pengajuan berjalan"}
      </p>
      <div
        aria-hidden="true"
        className="h-5 overflow-hidden rounded-full bg-ink/6 p-1 shadow-[inset_0_1px_3px_rgb(20_20_22/0.16)]"
      >
        <div className="flex h-full gap-0.5 motion-safe:animate-tube-fill">
          {total > 0 &&
            stages
              .filter((stage) => stage.value > 0)
              .map((stage) => (
                <span
                  key={stage.label}
                  style={{ flexGrow: stage.value }}
                  className={`rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] ${stage.color}`}
                />
              ))}
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-2 gap-y-4 min-[360px]:grid-cols-4 md:gap-4">
        {stages.map((stage) => (
          <div key={stage.label} className="flex min-w-0 flex-col">
            <dt className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${stage.color}`}
              />
              {stage.label}
            </dt>
            <dd className="order-first text-2xl font-normal tabular-nums">
              {stage.value}
            </dd>
          </div>
        ))}
        <div className="flex min-w-0 flex-col min-[360px]:border-l min-[360px]:border-ink/8 min-[360px]:pl-3 md:pl-4">
          <dt className="text-xs text-neutral-600">Dibayar</dt>
          <dd className="order-first text-2xl font-normal tabular-nums">
            {summary.paid}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

export default function Beranda() {
  const { onLogout } = useOutletContext();
  const [period, setPeriod] = useState("TODAY");
  const profile = useProfile();
  const notice = useLocation().state?.notice;
  const { data, isPending, isError, error, refetch, isFetching } =
    useMySummary();

  const summary = data?.summary;
  const allRequests = data?.requests ?? [];
  const requests = allRequests.filter((item) =>
    isInPeriod(item.tanggal_request, period),
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header className="flex items-center gap-3 pt-1 md:pt-3">
        {profile.data && (
          <span className="md:hidden">
            <Avatar
              name={profile.data.nama_lengkap}
              src={profile.data.image_path}
            />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-neutral-600">{greeting()}</p>
          <h1 className="truncate text-xl leading-tight font-semibold tracking-tight md:text-3xl">
            {profile.data?.nama_lengkap ?? "Pengajuan Anda"}
          </h1>
        </div>
        <ThemePicker className="md:hidden" />
        <IconButton
          icon={LogOut}
          label="Keluar"
          onClick={onLogout}
          className="md:hidden"
        />
      </header>

      {notice && (
        <p
          role="status"
          className="glass rounded-2xl px-4 py-3 text-sm font-medium"
        >
          {notice}
        </p>
      )}

      {isPending && <Skeleton />}

      {isError && (
        <Card className="flex flex-col items-start gap-4 p-6">
          <div>
            <h1 className="font-semibold">Ringkasan tidak dapat dimuat</h1>
            <p className="mt-1 text-sm text-neutral-600">{error.message}</p>
          </div>
          <Button
            variant="light"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Memuat…" : "Muat ulang"}
          </Button>
        </Card>
      )}

      {summary && (
        <>
          <SummaryPanel summary={summary} />

          <Card className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                Pengajuan terbaru
              </h2>
              <Link
                to="/pengajuan"
                className="rounded-full text-sm font-medium text-primary-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Lihat semua
              </Link>
            </div>

            {allRequests.length > 0 && (
              <div className="mt-4">
                <Tabs
                  label="Saring periode"
                  items={PERIODS}
                  value={period}
                  onChange={setPeriod}
                />
              </div>
            )}

            {allRequests.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="text-sm text-neutral-600">
                  Pengajuan yang Anda buat akan muncul di sini.
                </p>
                <Link
                  to="/pengajuan/baru"
                  className="glass-primary inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  <Plus className="size-5" strokeWidth={1.5} />
                  Buat Pengajuan
                </Link>
              </div>
            ) : requests.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-600">
                Tidak ada pengajuan pada periode ini.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col divide-y divide-ink/6">
                {requests.slice(0, MAX_ITEMS).map((request) => (
                  <li key={request.id_request}>
                    <RequestListItem request={request} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
