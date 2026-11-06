import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { logout } from "../api/auth";
import BottomNav from "../components/BottomNav";
import Button from "../components/Button";
import Dialog from "../components/Dialog";
import PullToRefresh from "../components/PullToRefresh";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const askLogout = () => setConfirmLogout(true);

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-dvh">
      <PullToRefresh />
      <Sidebar onLogout={askLogout} />
      <main className="relative mx-auto max-w-6xl px-4 pt-6 pb-28 md:pr-8 md:pb-8 md:pl-72 lg:pt-8">
        <Outlet context={{ onLogout: askLogout }} />
      </main>
      <BottomNav />
      {confirmLogout && (
        <Dialog label="Keluar" onClose={() => setConfirmLogout(false)} className="w-[calc(100%-2rem)] max-w-sm p-6">
          <h2 className="text-lg font-semibold">Keluar dari akun?</h2>
          <p className="mt-1 text-sm text-neutral-600">Anda perlu masuk kembali untuk melihat pengajuan. Isian yang belum dikirim akan hilang.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="light" className="px-3" data-autofocus onClick={() => setConfirmLogout(false)}>
              Batal
            </Button>
            <Button className="px-3" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
