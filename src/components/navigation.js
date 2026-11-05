import { FileText, History, House, Plus } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Beranda", icon: House, end: true },
  { to: "/pengajuan", label: "Pengajuan", icon: FileText, end: true },
  { to: "/riwayat", label: "Riwayat", icon: History },
];

export const CREATE_ITEM = { to: "/pengajuan/baru", label: "Buat Pengajuan", icon: Plus };
