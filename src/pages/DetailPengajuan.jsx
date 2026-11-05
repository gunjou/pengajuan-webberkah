import { ArrowLeft, Download, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { getPurchaseRequestPdf } from "../api/purchaseRequests";
import AttachmentModal from "../components/AttachmentModal";
import Button from "../components/Button";
import Card from "../components/Card";
import Dialog from "../components/Dialog";
import IconButton from "../components/IconButton";
import { PriorityBadge } from "../components/StatusBadge";
import StatusTracker from "../components/StatusTracker";
import { useDeletePurchaseRequest, usePurchaseRequest } from "../hooks/usePurchaseRequests";
import { formatJumlah, formatRupiah, formatTanggal, formatTanggalWaktu } from "../utils/format";
import { STATUS } from "../utils/status";

const FLOW = ["REQUESTED", "REVIEWED", "APPROVED", "PAID"];
const DELETABLE = ["REQUESTED", "REJECTED"];

const isHttpUrl = (value) => /^https?:\/\//i.test(value ?? "");

function savePdf(blob, request) {
  const name = `Pengajuan ${request.pegawai?.nama_lengkap ?? ""} - ${request.nama_pekerjaan} - ${request.tanggal_request}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name.replace(/[\\/:*?"<>|]/g, "-");
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="shrink-0 text-sm text-neutral-600">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium break-words">{value || "-"}</dd>
    </div>
  );
}

function AttachmentButton({ attachment, icon: Icon, onPreview }) {
  const className =
    "flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white/50 p-3 text-left ring-1 ring-ink/5 transition-colors hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-primary-600";
  const content = (
    <>
      <Icon className="size-5 shrink-0 text-primary-700" strokeWidth={1.5} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{attachment.name}</span>
      <span className="shrink-0 text-xs font-semibold text-primary-700">Lihat</span>
    </>
  );
  if (!isHttpUrl(attachment.path)) return null;
  return (
    <button type="button" onClick={() => onPreview(attachment)} className={className}>
      {content}
    </button>
  );
}

function Timeline({ request, onPreview }) {
  const history = request.history ?? [];
  const byStatus = Object.fromEntries(history.map((entry) => [entry.status, entry]));
  const rejected = byStatus.REJECTED;
  // Tahap setelah penolakan tidak akan pernah terjadi, jadi tidak ditampilkan.
  const statuses = rejected ? [...FLOW.filter((status) => byStatus[status]), "REJECTED"] : FLOW;

  return (
    <ol>
      {statuses.map((status, index) => {
        const entry = byStatus[status];
        const last = index === statuses.length - 1;
        const dot = status === "REJECTED" ? "bg-primary-600" : STATUS[status]?.bar;
        return (
          <li key={status} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute top-4 bottom-0 left-[5px] w-0.5 bg-ink/10" />}
            <span
              aria-hidden="true"
              className={`relative mt-1 size-3 shrink-0 rounded-full ${entry ? dot : "bg-ink/15"}`}
            />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${entry ? "" : "text-neutral-500"}`}>{STATUS[status].label}</p>
              {entry ? (
                <p className="mt-0.5 text-xs text-neutral-600">
                  {entry.nama_pegawai}
                  <span className="block">{formatTanggalWaktu(entry.created_at)}</span>
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-neutral-500">Belum sampai tahap ini</p>
              )}
              {entry?.note && (
                <p className="mt-2 rounded-xl bg-white/50 px-3 py-2 text-xs leading-relaxed whitespace-pre-line">
                  {entry.note}
                </p>
              )}
              {status === "PAID" && entry && (
                <div className="mt-2">
                  {request.payment?.bukti_bayar ? (
                    <>
                      <AttachmentButton
                        attachment={{ name: "Bukti bayar", path: request.payment.bukti_bayar }}
                        icon={ImageIcon}
                        onPreview={onPreview}
                      />
                      <p className="mt-1.5 text-xs text-neutral-500">Semua bukti pembayaran ada di PDF.</p>
                    </>
                  ) : (
                    <p className="text-xs text-neutral-500">Bukti pembayaran tidak tersedia.</p>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function NotFound({ message, retry }) {
  return (
    <Card className="flex flex-col items-start gap-4 p-6">
      <p className="text-sm text-neutral-600">{message}</p>
      {retry ? (
        <Button variant="light" onClick={retry}>
          Muat ulang
        </Button>
      ) : (
        <Link to="/" className="text-sm font-semibold text-primary-700 hover:underline">
          Ke Beranda
        </Link>
      )}
    </Card>
  );
}

export default function DetailPengajuan() {
  const { id } = useParams();
  const validId = /^\d+$/.test(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: request, isPending, isError, error, refetch } = usePurchaseRequest(id);

  const [preview, setPreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const deletion = useDeletePurchaseRequest(id, {
    onSuccess: () =>
      navigate("/", { replace: true, state: { notice: `Pengajuan ${request.request_number} dihapus.` } }),
  });

  // Dibuka langsung lewat tautan: tidak ada halaman sebelumnya untuk dituju.
  const goBack = () => (location.key === "default" ? navigate("/") : navigate(-1));

  const handleDownload = async () => {
    setDownloading(true);
    setPdfError("");
    try {
      savePdf(await getPurchaseRequestPdf(id), request);
    } catch (err) {
      setPdfError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const hasPayment =
    request?.payment &&
    (request.payment.description || request.payment.bank || request.payment.account_number || request.payment.account_name);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <header className="flex items-center gap-3">
        <IconButton icon={ArrowLeft} label="Kembali" onClick={goBack} />
        <p className="min-w-0 flex-1 truncate text-sm text-neutral-600">{request?.request_number ?? "Detail pengajuan"}</p>
        {request && DELETABLE.includes(request.status) && (
          <IconButton
            icon={Trash2}
            label="Hapus pengajuan"
            onClick={() => {
              deletion.reset();
              setConfirmDelete(true);
            }}
            className="text-primary-700"
          />
        )}
      </header>

      {!validId || (isError && error.status === 404) ? (
        <NotFound message="Pengajuan ini tidak ditemukan atau bukan milik Anda." />
      ) : isError ? (
        <NotFound message={error.message} retry={() => refetch()} />
      ) : isPending ? (
        <div aria-busy="true" aria-label="Memuat data" className="flex flex-col gap-4">
          <div className="h-40 animate-pulse rounded-card bg-white/50" />
          <div className="h-72 animate-pulse rounded-card bg-white/50" />
        </div>
      ) : (
        <>
          <section className="px-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <StatusTracker status={request.status} />
              {request.priority !== "NORMAL" && <PriorityBadge priority={request.priority} />}
            </div>
            <h1 className="mt-3 text-2xl font-normal break-words text-ink/60 md:text-3xl">
              {request.nama_pekerjaan}
            </h1>
            <p className="mt-2 text-3xl leading-tight font-semibold tracking-tight tabular-nums md:text-5xl">
              {formatRupiah(request.total_amount)}
            </p>
          </section>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
              <Card className="p-5 md:p-6">
                <h2 className="font-semibold">Rincian</h2>
                <ul className="mt-2 divide-y divide-ink/6">
                  {request.items?.map((item) => (
                    <li key={item.id_item} className="flex justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium break-words">{item.keterangan}</p>
                        <p className="mt-0.5 text-xs text-neutral-600">
                          {formatJumlah(item.jumlah)} {item.unit} × {formatRupiah(item.harga_satuan)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">{formatRupiah(item.total)}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 flex justify-between gap-4 border-t border-ink/15 pt-3 font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatRupiah(request.total_amount)}</span>
                </p>
              </Card>

              <Card className="p-5 md:p-6">
                <h2 className="font-semibold">Informasi</h2>
                <dl className="mt-1 divide-y divide-ink/6">
                  <Info label="Tanggal" value={formatTanggal(request.tanggal_request)} />
                  <Info label="Pemohon" value={request.pegawai?.nama_lengkap} />
                  <Info label="Departemen" value={request.departemen?.nama_departemen} />
                </dl>
                {request.note && (
                  <p className="mt-2 rounded-2xl bg-white/50 p-3 text-sm leading-relaxed whitespace-pre-line">{request.note}</p>
                )}
              </Card>

              {hasPayment && (
                <Card className="p-5 md:p-6">
                  <h2 className="font-semibold">Pembayaran</h2>
                  <dl className="mt-1 divide-y divide-ink/6">
                    <Info label="Keterangan" value={request.payment.description} />
                    <Info label="Bank" value={request.payment.bank} />
                    <Info label="Nomor rekening" value={request.payment.account_number} />
                    <Info label="Atas nama" value={request.payment.account_name} />
                  </dl>
                </Card>
              )}

              {request.attachment?.path && (
                <Card className="p-5 md:p-6">
                  <h2 className="mb-3 font-semibold">Lampiran</h2>
                  <AttachmentButton
                    attachment={{ name: request.attachment.name || "Lampiran", path: request.attachment.path }}
                    icon={FileText}
                    onPreview={setPreview}
                  />
                </Card>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-8">
              <Card className="p-5 md:p-6">
                <h2 className="mb-4 font-semibold">Perjalanan pengajuan</h2>
                <Timeline request={request} onPreview={setPreview} />
              </Card>
              <Button variant="light" onClick={handleDownload} disabled={downloading}>
                <Download className="size-5" strokeWidth={1.5} />
                {downloading ? "Menyiapkan PDF…" : "Unduh PDF"}
              </Button>
              {pdfError && (
                <p role="alert" className="text-sm text-primary-700">
                  {pdfError}
                </p>
              )}
              <p className="text-center text-xs text-neutral-500">
                Diperbarui {formatTanggalWaktu(request.updated_at)}
              </p>
            </div>
          </div>
        </>
      )}

      {preview && <AttachmentModal attachment={preview} onClose={() => setPreview(null)} />}

      {confirmDelete && (
        <Dialog
          label="Hapus pengajuan"
          onClose={() => !deletion.isPending && setConfirmDelete(false)}
          className="w-[calc(100%-2rem)] max-w-sm p-6"
        >
          <h2 className="text-lg font-semibold">Hapus pengajuan ini?</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {request.nama_pekerjaan} tidak akan muncul lagi di daftar Anda.
          </p>
          {deletion.isError && (
            <p role="alert" className="mt-3 text-sm text-primary-700">
              {deletion.error.message}
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="light" className="px-3" disabled={deletion.isPending} onClick={() => setConfirmDelete(false)}>
              Batal
            </Button>
            <Button className="px-3" disabled={deletion.isPending} onClick={() => deletion.mutate()}>
              {deletion.isPending ? "Menghapus…" : "Hapus"}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
