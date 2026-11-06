import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Dialog from "./Dialog";
import IconButton from "./IconButton";

function cameraErrorMessage(error) {
  if (error?.name === "NotAllowedError") return "Akses kamera ditolak. Izinkan kamera di pengaturan browser, atau pilih file.";
  if (error?.name === "NotFoundError") return "Kamera tidak ditemukan di perangkat ini. Silakan pilih file.";
  return "Kamera tidak bisa dibuka. Silakan pilih file.";
}

/** Kamera di dalam halaman, untuk perangkat yang tidak membuka kamera lewat input file (mis. laptop). */
export default function CameraDialog({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream;
    let cancelled = false;
    (async () => {
      try {
        // mediaDevices tidak tersedia di halaman tanpa HTTPS.
        const opened = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          opened.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = opened;
        videoRef.current.srcObject = opened;
      } catch (err) {
        if (!cancelled) setError(cameraErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Gagal mengambil gambar. Silakan coba lagi.");
          return;
        }
        onCapture(new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <Dialog label="Tangkap gambar" onClose={onClose} className="w-[calc(100%-2rem)] max-w-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="pl-2 text-lg font-semibold">Tangkap gambar</h2>
        <IconButton icon={X} label="Tutup" onClick={onClose} data-autofocus />
      </div>
      {error ? (
        <p role="alert" className="mt-3 rounded-2xl bg-white/50 p-4 text-sm text-neutral-600">
          {error}
        </p>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setReady(true)}
            className="mt-3 max-h-[60dvh] w-full rounded-2xl bg-ink object-contain"
          />
          <Button type="button" disabled={!ready} onClick={capture} className="mt-3 w-full">
            <Camera className="size-5" strokeWidth={1.5} />
            {ready ? "Ambil gambar" : "Membuka kamera…"}
          </Button>
        </>
      )}
    </Dialog>
  );
}
