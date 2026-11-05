import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import IconButton from "./IconButton";

const ZOOMS = [1, 1.5, 2, 3];
const MAX_CANVAS_PIXELS = 12_000_000; // batas aman kanvas di Safari iOS

async function loadPdfJs() {
  // Dimuat saat dibutuhkan; build legacy agar berjalan di browser HP yang lebih lama.
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

/** Halaman hanya digambar saat mendekati layar, agar PDF panjang tidak menghabiskan memori. */
function PdfPage({ doc, number, width, onError }) {
  const canvasRef = useRef(null);
  const [ratio, setRatio] = useState(1.414);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "600px 0px",
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !width) return undefined;
    let task;
    let cancelled = false;
    (async () => {
      try {
        const page = await doc.getPage(number);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        setRatio(base.height / base.width);
        let scale = (width * Math.min(window.devicePixelRatio || 1, 2)) / base.width;
        const pixels = base.width * base.height * scale * scale;
        if (pixels > MAX_CANVAS_PIXELS) scale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        task = page.render({ canvas, viewport });
        await task.promise;
      } catch (error) {
        if (error?.name !== "RenderingCancelledException" && !cancelled) onError();
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, number, width, visible, onError]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Halaman ${number}`}
      style={{ width, height: width * ratio }}
      className="block bg-white shadow-sm"
    />
  );
}

export default function PdfViewer({ blob, onError }) {
  const containerRef = useRef(null);
  const [doc, setDoc] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(0);

  useEffect(() => {
    let task;
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const data = new Uint8Array(await blob.arrayBuffer());
        if (cancelled) return;
        task = pdfjs.getDocument({ data });
        const loaded = await task.promise;
        if (!cancelled) setDoc(loaded);
      } catch {
        if (!cancelled) onError();
      }
    })();
    return () => {
      cancelled = true;
      task?.destroy();
    };
  }, [blob, onError]);

  // Mengikuti lebar layar, termasuk saat HP diputar.
  useEffect(() => {
    const element = containerRef.current;
    const observer = new ResizeObserver(() => setContainerWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const pageWidth = Math.max(containerWidth - 16, 0) * ZOOMS[zoomIndex];

  return (
    <div className="relative h-full">
      <div ref={containerRef} className="h-full overflow-auto p-2">
        {doc ? (
          <div className="flex w-max min-w-full flex-col items-center gap-2">
            {Array.from({ length: doc.numPages }, (_, index) => (
              <PdfPage key={index} doc={doc} number={index + 1} width={pageWidth} onError={onError} />
            ))}
          </div>
        ) : (
          <div role="status" className="flex h-full flex-col items-center justify-center gap-3 text-sm text-neutral-600">
            <span
              aria-hidden="true"
              className="size-8 rounded-full border-2 border-ink/10 border-t-primary-600 motion-safe:animate-spin"
            />
            Memuat PDF
          </div>
        )}
      </div>
      {doc && (
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <span className="glass rounded-full px-3 py-1.5 text-xs font-medium tabular-nums">{doc.numPages} halaman</span>
          <IconButton
            icon={Minus}
            label="Perkecil"
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((value) => value - 1)}
            className="disabled:opacity-40"
          />
          <IconButton
            icon={Plus}
            label="Perbesar"
            disabled={zoomIndex === ZOOMS.length - 1}
            onClick={() => setZoomIndex((value) => value + 1)}
            className="disabled:opacity-40"
          />
        </div>
      )}
    </div>
  );
}
