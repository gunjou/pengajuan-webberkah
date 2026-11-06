import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const THRESHOLD = 70; // jarak tarik (px) untuk memicu muat ulang
const MAX_PULL = 110;
const REST = 56; // posisi ikon selama memuat
const MIN_SPIN_MS = 500; // agar putaran ikon sempat terlihat

/** Sentuhan di dalam dialog atau area yang masih bisa digulir ke atas bukan tarikan refresh. */
function canStartPull(target) {
  if (window.scrollY > 0 || target.closest?.("dialog")) return false;
  for (let element = target; element && element !== document.body; element = element.parentElement) {
    if (element.scrollTop > 0) return false;
  }
  return true;
}

/** Pengganti tarik-untuk-refresh browser; mengambil ulang data tanpa menghapus isian form. */
export default function PullToRefresh() {
  const queryClient = useQueryClient();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const gesture = useRef({ startY: null, distance: 0, busy: false });

  useEffect(() => {
    const state = gesture.current;

    const reset = () => {
      state.startY = null;
      state.distance = 0;
    };

    const onStart = (event) => {
      if (state.busy || event.touches.length !== 1 || !canStartPull(event.target)) return reset();
      state.startY = event.touches[0].clientY;
    };

    const onMove = (event) => {
      if (state.startY === null) return;
      if (event.touches.length !== 1) {
        reset();
        setPull(0);
        return;
      }
      const delta = event.touches[0].clientY - state.startY;
      if (delta <= 0) {
        state.distance = 0;
        setPull(0);
        return;
      }
      if (event.cancelable) event.preventDefault();
      state.distance = Math.min(delta * 0.5, MAX_PULL);
      setPull(state.distance);
    };

    const onEnd = async () => {
      if (state.startY === null) return;
      const triggered = state.distance >= THRESHOLD;
      reset();
      setPull(0);
      if (!triggered) return;
      state.busy = true;
      setRefreshing(true);
      await Promise.all([
        queryClient.refetchQueries({ type: "active" }),
        new Promise((resolve) => setTimeout(resolve, MIN_SPIN_MS)),
      ]);
      state.busy = false;
      setRefreshing(false);
    };

    // passive: false agar tarikan bisa menahan gulir bawaan (terutama Safari iOS).
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [queryClient]);

  if (!pull && !refreshing) return null;

  const offset = refreshing ? REST : pull;
  const progress = Math.min(pull / THRESHOLD, 1);

  return (
    <div
      role={refreshing ? "status" : undefined}
      aria-label={refreshing ? "Memuat ulang data" : undefined}
      style={{ transform: `translate(-50%, ${offset - 44}px)`, opacity: refreshing ? 1 : progress }}
      className="glass pointer-events-none fixed top-0 left-1/2 z-30 flex size-11 items-center justify-center rounded-full"
    >
      <RefreshCw
        aria-hidden="true"
        style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)` }}
        className={`size-5 text-primary-700 ${refreshing ? "motion-safe:animate-spin" : ""}`}
        strokeWidth={1.5}
      />
    </div>
  );
}
