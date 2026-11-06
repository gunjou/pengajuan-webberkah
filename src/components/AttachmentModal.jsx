import { Download, ExternalLink, FileWarning, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Dialog from "./Dialog";
import IconButton from "./IconButton";
import PdfViewer from "./PdfViewer";

const startsWith = (bytes, signature) => signature.every((byte, index) => bytes[index] === byte);

/** Jenis file dari isinya, karena URL bisa tanpa ekstensi. SVG sengaja tidak termasuk. */
async function detectFromBlob(blob) {
  const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return { kind: "pdf", type: "application/pdf" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return { kind: "image", type: "image/png" };
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { kind: "image", type: "image/jpeg" };
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return { kind: "image", type: "image/gif" };
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && bytes[8] === 0x57) return { kind: "image", type: "image/webp" };
  // Format seperti HEIC tetap dicoba; jika browser tidak bisa, onError menampilkan pilihan lain.
  if (/^image\/(heic|heif|avif|bmp)$/.test(blob.type)) return { kind: "image", type: blob.type };
  return { kind: "other", type: blob.type };
}

function detectFromName({ name = "", path = "" }) {
  const value = `${path.split("?")[0]} ${name}`.toLowerCase();
  if (/\.pdf(\s|$)/.test(value)) return "pdf";
  if (/\.(jpe?g|png|gif|webp|heic|avif|bmp)(\s|$)/.test(value)) return "image";
  return "other";
}

/** Blob dipakai agar tidak terhalang X-Frame-Options dan Content-Disposition. */
function useAttachmentSource(attachment) {
  const [source, setSource] = useState({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl;

    (async () => {
      try {
        const response = await fetch(attachment.path, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const { kind, type } = await detectFromBlob(blob);
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type }));
        setSource({ status: "ready", kind, url: objectUrl, isBlob: true, blob: new Blob([blob], { type }) });
      } catch (error) {
        if (error.name === "AbortError") return;
        // Mis. CDN menolak CORS: coba tampilkan langsung dari URL aslinya.
        setSource({ status: "ready", kind: detectFromName(attachment), url: attachment.path, isBlob: false });
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment]);

  return source;
}

const ACTION_CLASS =
  "glass flex size-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-primary-600";

export default function AttachmentModal({ attachment, onClose }) {
  const source = useAttachmentSource(attachment);
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const handleFailed = useCallback(() => setFailed(true), []);
  // Tanpa blob (mis. CORS) PDF.js tidak bisa membaca PDF, dan iframe umumnya kosong di HP.
  const unavailable =
    failed || (source.status === "ready" && (source.kind === "other" || (source.kind === "pdf" && !source.isBlob)));

  return (
    <Dialog
      label={attachment.name}
      onClose={onClose}
      className="h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl overflow-hidden"
    >
      <div className="flex h-full flex-col gap-3 p-3">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate pl-2 text-sm font-medium">{attachment.name}</p>
          <a
            href={source.isBlob ? source.url : attachment.path}
            download={source.isBlob ? attachment.name : undefined}
            target={source.isBlob ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label="Unduh lampiran"
            title="Unduh lampiran"
            className={ACTION_CLASS}
          >
            <Download className="size-5" strokeWidth={1.5} />
          </a>
          <a
            href={attachment.path}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buka di tab baru"
            title="Buka di tab baru"
            className={ACTION_CLASS}
          >
            <ExternalLink className="size-5" strokeWidth={1.5} />
          </a>
          <IconButton icon={X} label="Tutup" onClick={onClose} className="shrink-0" data-autofocus />
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto rounded-2xl bg-white/50">
          {source.status === "loading" && (
            <div role="status" className="flex h-full flex-col items-center justify-center gap-3 text-sm text-neutral-600">
              <span
                aria-hidden="true"
                className="size-8 rounded-full border-2 border-ink/10 border-t-primary-600 motion-safe:animate-spin"
              />
              Memuat lampiran
            </div>
          )}

          {source.status === "ready" && unavailable && (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <FileWarning className="size-8 text-neutral-500" strokeWidth={1.5} />
              <p className="max-w-xs text-sm text-neutral-600">
                File ini tidak bisa ditampilkan di sini. Silakan buka langsung filenya.
              </p>
              <a
                href={attachment.path}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                <ExternalLink className="size-4" strokeWidth={1.5} />
                Buka file
              </a>
            </div>
          )}

          {source.status === "ready" && !unavailable && source.kind === "image" && (
            <button
              type="button"
              onClick={() => setZoomed((value) => !value)}
              aria-label={zoomed ? "Perkecil gambar" : "Perbesar gambar"}
              className={`flex min-h-full min-w-full items-center justify-center ${
                zoomed ? "w-max cursor-zoom-out" : "h-full cursor-zoom-in"
              }`}
            >
              <img
                src={source.url}
                alt={attachment.name}
                onError={() => setFailed(true)}
                className={zoomed ? "max-w-none" : "max-h-full max-w-full object-contain"}
              />
            </button>
          )}

          {source.status === "ready" && !unavailable && source.kind === "pdf" && (
            <PdfViewer blob={source.blob} onError={handleFailed} />
          )}
        </div>
      </div>
    </Dialog>
  );
}
