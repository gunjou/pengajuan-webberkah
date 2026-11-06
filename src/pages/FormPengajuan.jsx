import {
  ArrowLeft,
  Camera,
  ChevronDown,
  FileText,
  FileUp,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router";
import { uploadPurchaseRequestAttachments } from "../api/purchaseRequests";
import Button from "../components/Button";
import CameraDialog from "../components/CameraDialog";
import Card from "../components/Card";
import IconButton from "../components/IconButton";
import Tabs from "../components/Tabs";
import { useDepartemen } from "../hooks/useDepartemen";
import { useCreatePurchaseRequest } from "../hooks/usePurchaseRequests";
import { formatRupiah, toDateKey } from "../utils/format";
import {
  buildPayload,
  emptyItem,
  formatRibuan,
  grandTotal,
  itemTotal,
  sanitizeHarga,
  sanitizeJumlah,
  validateForm,
} from "../utils/pengajuanForm";

const PRIORITIES = [
  { value: "NORMAL", label: "Normal" },
  { value: "URGENT", label: "Urgent" },
  { value: "TOP_URGENT", label: "Top Urgent" },
];

const INPUT_CLASS =
  "h-12 w-full min-w-0 appearance-none rounded-2xl bg-white/70 px-4 text-base outline-none ring-1 ring-ink/8 focus:ring-2 focus:ring-primary-500 aria-invalid:ring-2 aria-invalid:ring-primary-600 disabled:opacity-60";

const PICKER_CLASS =
  "glass-button h-13 items-center justify-center gap-2 rounded-full text-[15px] font-semibold focus-within:ring-2 focus-within:ring-primary-500";

const isSupportedAttachment = (file) =>
  file.type === "application/pdf" || file.type.startsWith("image/");
const fileIdentity = (file) => `${file.name}|${file.size}|${file.lastModified}`;

function Field({ label, optional, error, className = "", children }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        {label}
        {optional && (
          <span className="font-normal text-neutral-400"> (opsional)</span>
        )}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-primary-700">{error}</span>
      )}
    </label>
  );
}

function Section({ title, children }) {
  return (
    <Card className="flex flex-col gap-4 p-5 md:p-6">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </Card>
  );
}

export default function FormPengajuan() {
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    tanggal_request: toDateKey(new Date()),
    id_departemen: "",
    nama_pekerjaan: "",
    priority: "NORMAL",
    note: "",
    payment_description: "",
    payment_bank: "",
    payment_account_number: "",
    payment_account_name: "",
    items: [emptyItem()],
  }));
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [attachments, setAttachments] = useState([]); // { id, file, previewUrl }
  const [cameraOpen, setCameraOpen] = useState(false);

  // Hasil upload dipakai ulang jika pengajuan gagal terkirim dan lampiran tidak berubah.
  const uploadedAttachment = useRef(null);
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(
    () => () =>
      attachmentsRef.current.forEach(
        ({ previewUrl }) => previewUrl && URL.revokeObjectURL(previewUrl),
      ),
    [],
  );

  // Kunci langsung: isPending baru berubah setelah render, sehingga klik cepat bisa lolos.
  const submitLock = useRef(false);
  const dirtyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Menjaga isian saat berpindah lewat navigasi, sidebar, atau tombol kembali.
  // Logout sudah punya dialog konfirmasi sendiri, jadi tidak ditanya dua kali.
  const blocker = useBlocker(
    ({ nextLocation }) =>
      nextLocation.pathname !== "/login" &&
      dirtyRef.current &&
      !window.confirm("Isian belum dikirim dan akan hilang. Tetap keluar?"),
  );
  useEffect(() => {
    if (blocker.state === "blocked") blocker.reset();
  }, [blocker]);

  const departemen = useDepartemen();
  const mutation = useCreatePurchaseRequest({
    onSettled: () => {
      submitLock.current = false;
    },
    onSuccess: (data) => {
      dirtyRef.current = false; // navigasi ini tidak perlu konfirmasi
      setDirty(false);
      navigate("/", {
        replace: true,
        state: { notice: `Pengajuan ${data?.request_number ?? ""} terkirim.` },
      });
    },
  });

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const clearError = (key) =>
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });

  const setField = (field, value) => {
    setDirty(true);
    setForm((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  const setItem = (index, field, value) => {
    setDirty(true);
    setForm((current) => ({
      ...current,
      items: current.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
    clearError(`items.${index}.${field}`);
  };

  const addItem = () => {
    setDirty(true);
    setForm((current) => ({
      ...current,
      items: [...current.items, emptyItem()],
    }));
  };

  const removeItem = (index) => {
    setDirty(true);
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, i) => i !== index),
    }));
    // Pesan kesalahan memakai indeks, jadi dinilai ulang setelah baris bergeser.
    setErrors({});
  };

  const addFiles = (selected) => {
    const supported = selected.filter(isSupportedAttachment);
    setUploadError(
      supported.length < selected.length
        ? "Hanya file PDF dan gambar yang bisa dilampirkan."
        : "",
    );
    const known = new Set(attachments.map(({ file }) => fileIdentity(file)));
    const added = supported
      .filter((file) => {
        const identity = fileIdentity(file);
        if (known.has(identity)) return false;
        known.add(identity);
        return true;
      })
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      }));
    if (!added.length) return;
    uploadedAttachment.current = null;
    setDirty(true);
    setAttachments([...attachments, ...added]);
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = ""; // agar file yang sama bisa dipilih ulang
    if (selected.length) addFiles(selected);
  };

  const removeAttachment = ({ id, previewUrl }) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    uploadedAttachment.current = null;
    setDirty(true);
    setUploadError("");
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  const handleBack = () => navigate("/");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLock.current || uploading) return;
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    const firstKey = Object.keys(nextErrors)[0];
    if (firstKey) {
      requestAnimationFrame(() =>
        document.querySelector(`[name="${firstKey}"]`)?.focus(),
      );
      return;
    }
    submitLock.current = true;

    if (attachments.length && !uploadedAttachment.current) {
      setUploading(true);
      setUploadError("");
      try {
        const data = await uploadPurchaseRequestAttachments(
          attachments.map(({ file }) => file),
        );
        uploadedAttachment.current = {
          attachment_name: data.attachment_name,
          attachment_path: data.attachment_path,
        };
      } catch (error) {
        setUploadError(error.message);
        submitLock.current = false;
        return;
      } finally {
        setUploading(false);
      }
    }
    mutation.mutate(buildPayload({ ...form, ...uploadedAttachment.current }));
  };

  const busy = mutation.isPending || uploading;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <IconButton icon={ArrowLeft} label="Kembali" onClick={handleBack} />
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Buat Pengajuan
        </h1>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <Section title="Informasi">
            <Field label="Nama pekerjaan" error={errors.nama_pekerjaan}>
              <input
                name="nama_pekerjaan"
                value={form.nama_pekerjaan}
                onChange={(e) => setField("nama_pekerjaan", e.target.value)}
                aria-invalid={Boolean(errors.nama_pekerjaan)}
                className={INPUT_CLASS}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tanggal" error={errors.tanggal_request}>
                <input
                  type="date"
                  name="tanggal_request"
                  value={form.tanggal_request}
                  onChange={(e) => setField("tanggal_request", e.target.value)}
                  aria-invalid={Boolean(errors.tanggal_request)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field
                label="Departemen"
                error={
                  errors.id_departemen ??
                  (departemen.isError ? departemen.error.message : undefined)
                }
              >
                <span className="relative block">
                  <select
                    name="id_departemen"
                    value={form.id_departemen}
                    onChange={(e) => setField("id_departemen", e.target.value)}
                    disabled={departemen.isPending || departemen.isError}
                    aria-invalid={Boolean(errors.id_departemen)}
                    className={`${INPUT_CLASS} pr-11`}
                  >
                    <option value="">
                      {departemen.isPending ? "Memuat…" : "Pilih departemen"}
                    </option>
                    {departemen.data?.map((row) => (
                      <option key={row.id_departemen} value={row.id_departemen}>
                        {row.nama_departemen}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute top-3.5 right-4 size-5 text-neutral-500"
                    strokeWidth={1.5}
                  />
                </span>
                {departemen.isError && (
                  <button
                    type="button"
                    onClick={() => departemen.refetch()}
                    className="mt-1 cursor-pointer text-xs font-semibold text-primary-700 underline"
                  >
                    Muat ulang
                  </button>
                )}
              </Field>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-neutral-600">
                Prioritas
              </p>
              <Tabs
                label="Prioritas"
                items={PRIORITIES}
                value={form.priority}
                onChange={(value) => setField("priority", value)}
              />
            </div>
            <Field label="Catatan" optional>
              <textarea
                name="note"
                rows={2}
                value={form.note}
                onChange={(e) => setField("note", e.target.value)}
                className={`${INPUT_CLASS} h-auto py-3`}
              />
            </Field>
          </Section>

          <Section title="Item">
            {form.items.map((item, index) => (
              <div
                key={item.key}
                className="flex flex-col gap-3 rounded-2xl bg-white/40 p-3 ring-1 ring-ink/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Item {index + 1}</p>
                  {form.items.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Hapus item ${index + 1}`}
                      onClick={() => removeItem(index)}
                      className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-white hover:text-primary-700"
                    >
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <Field
                  label="Keterangan"
                  error={errors[`items.${index}.keterangan`]}
                >
                  <input
                    name={`items.${index}.keterangan`}
                    value={item.keterangan}
                    onChange={(e) =>
                      setItem(index, "keterangan", e.target.value)
                    }
                    aria-invalid={Boolean(errors[`items.${index}.keterangan`])}
                    className={INPUT_CLASS}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_2fr]">
                  <Field label="Jumlah" error={errors[`items.${index}.jumlah`]}>
                    <input
                      name={`items.${index}.jumlah`}
                      inputMode="decimal"
                      value={item.jumlah.replace(".", ",")}
                      onChange={(e) =>
                        setItem(index, "jumlah", sanitizeJumlah(e.target.value))
                      }
                      aria-invalid={Boolean(errors[`items.${index}.jumlah`])}
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <Field label="Unit" error={errors[`items.${index}.unit`]}>
                    <input
                      name={`items.${index}.unit`}
                      placeholder="rim, pcs"
                      value={item.unit}
                      onChange={(e) => setItem(index, "unit", e.target.value)}
                      aria-invalid={Boolean(errors[`items.${index}.unit`])}
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <Field
                    label="Harga satuan (Rp)"
                    error={errors[`items.${index}.harga_satuan`]}
                    className="col-span-2 sm:col-span-1"
                  >
                    <input
                      name={`items.${index}.harga_satuan`}
                      inputMode="numeric"
                      value={formatRibuan(item.harga_satuan)}
                      onChange={(e) =>
                        setItem(
                          index,
                          "harga_satuan",
                          sanitizeHarga(e.target.value),
                        )
                      }
                      aria-invalid={Boolean(
                        errors[`items.${index}.harga_satuan`],
                      )}
                      className={INPUT_CLASS}
                    />
                  </Field>
                </div>
                <p className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-semibold">
                    {formatRupiah(itemTotal(item))}
                  </span>
                </p>
              </div>
            ))}
            <Button type="button" variant="light" onClick={addItem}>
              <Plus className="size-5" strokeWidth={1.5} />
              Tambah item
            </Button>
          </Section>

          <Section title="Pembayaran">
            <Field label="Deskripsi pembayaran" optional>
              <input
                name="payment_description"
                value={form.payment_description}
                onChange={(e) =>
                  setField("payment_description", e.target.value)
                }
                className={INPUT_CLASS}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Bank" optional>
                <input
                  name="payment_bank"
                  value={form.payment_bank}
                  onChange={(e) => setField("payment_bank", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Nomor rekening" optional>
                <input
                  name="payment_account_number"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.payment_account_number}
                  onChange={(e) =>
                    setField("payment_account_number", e.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Atas nama" optional>
                <input
                  name="payment_account_name"
                  autoComplete="off"
                  value={form.payment_account_name}
                  onChange={(e) =>
                    setField("payment_account_name", e.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          </Section>

          <Section title="Lampiran">
            <p className="-mt-2 text-xs text-neutral-600">
              PDF atau gambar. Beberapa lampiran akan disatukan sesuai urutan di
              bawah saat pengajuan dikirim.
            </p>
            {attachments.length > 0 && (
              <ul className="flex flex-col gap-2">
                {attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="flex items-center gap-3 rounded-2xl bg-white/60 p-2 pl-3 ring-1 ring-ink/5"
                  >
                    {attachment.previewUrl ? (
                      <img
                        src={attachment.previewUrl}
                        alt=""
                        className="size-10 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex size-10 shrink-0 items-center justify-center">
                        <FileText
                          className="size-5 text-primary-700"
                          strokeWidth={1.5}
                        />
                      </span>
                    )}
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">
                      {attachment.file.name}
                    </p>
                    <button
                      type="button"
                      aria-label={`Hapus lampiran ${attachment.file.name}`}
                      disabled={busy}
                      onClick={() => removeAttachment(attachment)}
                      className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-white hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="size-4" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <label
                className={`${PICKER_CLASS} flex min-w-0 flex-1 ${busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <FileUp className="size-5 shrink-0" strokeWidth={1.5} />
                {attachments.length ? "Tambah file" : "Pilih file"}
                <input
                  type="file"
                  name="lampiran"
                  accept="application/pdf,image/*"
                  multiple
                  disabled={busy}
                  onChange={handleFiles}
                  className="sr-only"
                />
              </label>
              {/* Perangkat sentuh memakai kamera bawaan lewat capture; desktop memakai kamera di dalam halaman. */}
              <label
                className={`${PICKER_CLASS} hidden min-w-0 flex-1 pointer-coarse:flex ${busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <Camera className="size-5 shrink-0" strokeWidth={1.5} />
                Tangkap gambar
                <input
                  type="file"
                  name="lampiran_kamera"
                  accept="image/*"
                  capture="environment"
                  disabled={busy}
                  onChange={handleFiles}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => setCameraOpen(true)}
                className={`${PICKER_CLASS} flex min-w-0 flex-1 pointer-coarse:hidden ${busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <Camera className="size-5 shrink-0" strokeWidth={1.5} />
                Buka Kamera
              </button>
            </div>
            {cameraOpen && (
              <CameraDialog
                onClose={() => setCameraOpen(false)}
                onCapture={(file) => {
                  addFiles([file]);
                  setCameraOpen(false);
                }}
              />
            )}
            {uploadError && (
              <p role="alert" className="text-sm text-primary-700">
                {uploadError}
              </p>
            )}
          </Section>
        </div>

        <Card
          highlight
          className="flex flex-col gap-4 p-5 md:p-6 lg:sticky lg:top-8"
        >
          <div>
            <p className="text-sm text-neutral-500">
              Total ({form.items.length} item)
            </p>
            <p className="mt-1 text-3xl font-light tracking-tight break-words">
              {formatRupiah(grandTotal(form.items))}
            </p>
          </div>
          {Object.keys(errors).length > 0 && (
            <p role="alert" className="text-sm text-primary-700">
              Periksa kembali isian yang ditandai.
            </p>
          )}
          {mutation.isError && (
            <p role="alert" className="text-sm text-primary-700">
              {mutation.error.message}
            </p>
          )}
          <Button type="submit" chevrons={!busy} disabled={busy}>
            {mutation.isPending
              ? "Mengirim…"
              : uploading
                ? "Mengunggah lampiran…"
                : "Kirim Pengajuan"}
          </Button>
        </Card>
      </div>
    </form>
  );
}
