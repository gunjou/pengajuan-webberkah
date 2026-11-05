import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router";
import { logout } from "../api/auth";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-dvh">
      <Sidebar onLogout={handleLogout} />
      <main className="relative mx-auto max-w-6xl px-4 pt-6 pb-28 md:pr-8 md:pb-8 md:pl-72 lg:pt-8">
        <Outlet context={{ onLogout: handleLogout }} />
      </main>
      <BottomNav />
    </div>
  );
}
