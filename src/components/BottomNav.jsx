import { NavLink } from "react-router";
import { CREATE_ITEM, NAV_ITEMS } from "./navigation";

function NavIcon({ item, primary = false }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      aria-label={item.label}
      title={item.label}
      className={({ isActive }) =>
        `flex size-12 items-center justify-center rounded-full transition active:scale-95 ${
          primary
            ? "glass-primary"
            : isActive
              ? "bg-white/80 text-primary-700 shadow-sm"
              : "text-ink"
        }`
      }
    >
      <Icon className="size-5" strokeWidth={1.5} />
    </NavLink>
  );
}

export default function BottomNav() {
  const [beranda, pengajuan, riwayat] = NAV_ITEMS;
  return (
    <nav
      aria-label="Navigasi utama"
      className="glass fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full p-1.5 md:hidden"
    >
      <NavIcon item={beranda} />
      <NavIcon item={pengajuan} />
      <NavIcon item={riwayat} />
      <NavIcon item={CREATE_ITEM} primary />
    </nav>
  );
}
