import { LogOut } from "lucide-react";
import { NavLink } from "react-router";
import logo from "../assets/logo_glass.png";
import { useProfile } from "../hooks/useProfile";
import Avatar from "./Avatar";
import ThemePicker from "./ThemePicker";
import { CREATE_ITEM, NAV_ITEMS } from "./navigation";

export default function Sidebar({ onLogout }) {
  const CreateIcon = CREATE_ITEM.icon;
  const { data: profile } = useProfile();
  return (
    <aside className="card-glass fixed inset-y-4 left-4 z-20 hidden w-60 flex-col p-4 md:flex">
      <div className="flex items-center gap-3 px-2 py-1">
        <img src={logo} alt="" className="size-10 object-contain" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">Berkah Angsana</p>
          <p className="text-xs text-neutral-500">Pengajuan</p>
        </div>
      </div>

      <NavLink
        to={CREATE_ITEM.to}
        className="mt-4 flex h-12 items-center justify-center gap-2 glass-primary rounded-full text-sm font-semibold transition hover:brightness-95 active:scale-[0.98]"
      >
        <CreateIcon className="size-5" strokeWidth={1.5} />
        {CREATE_ITEM.label}
      </NavLink>

      <nav aria-label="Navigasi utama" className="mt-6 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors ${
                isActive ? "bg-white/80 text-primary-700 shadow-sm" : "text-neutral-700 hover:bg-white/50"
              }`
            }
          >
            <Icon className="size-5" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
      {profile && (
        <div className="mb-2 flex items-center gap-3 px-2">
          <Avatar name={profile.nama_lengkap} src={profile.image_path} className="size-10 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile.nama_lengkap}</p>
            <p className="truncate text-xs text-neutral-600">{profile.jabatan}</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onLogout}
        className="flex min-w-0 flex-1 h-11 cursor-pointer items-center gap-3 rounded-full px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-white/50"
      >
        <LogOut className="size-5" strokeWidth={1.5} />
        Keluar
      </button>
      <ThemePicker />
      </div>
      </div>
    </aside>
  );
}
