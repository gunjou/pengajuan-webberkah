import { Check, Palette, X } from "lucide-react";
import { useState } from "react";
import { getTheme, saveTheme, THEME_PRESETS } from "../utils/theme";
import Dialog from "./Dialog";
import IconButton from "./IconButton";

export default function ThemePicker({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(getTheme);

  const choose = (value) => {
    setColor(value);
    saveTheme(value);
  };

  return (
    <>
      <IconButton
        icon={Palette}
        label="Ubah warna tema"
        className={className}
        onClick={() => {
          setColor(getTheme());
          setOpen(true);
        }}
      />
      {open && (
        <Dialog label="Warna tema" onClose={() => setOpen(false)} className="w-[calc(100%-2rem)] max-w-sm p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Warna tema</h2>
            <IconButton icon={X} label="Tutup" onClick={() => setOpen(false)} />
          </div>

          <div role="radiogroup" aria-label="Pilihan warna" className="mt-4 grid grid-cols-3 gap-2">
            {THEME_PRESETS.map((preset) => {
              const active = preset.value === color;
              return (
                <button
                  key={preset.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => choose(preset.value)}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl p-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary-600 ${
                    active ? "bg-white/80 shadow-sm" : "hover:bg-white/50"
                  }`}
                >
                  <span
                    style={{ backgroundColor: preset.value }}
                    className="flex size-10 items-center justify-center rounded-full text-white shadow-[inset_0_1px_1px_rgb(255_255_255/0.5)]"
                  >
                    {active && <Check className="size-5" strokeWidth={2} />}
                  </span>
                  {preset.label}
                </button>
              );
            })}
          </div>

          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white/50 px-4 py-3 text-sm font-medium">
            Warna lain
            <input
              type="color"
              value={color}
              onChange={(event) => choose(event.target.value)}
              className="size-9 cursor-pointer rounded-full border-0 bg-transparent"
            />
          </label>
        </Dialog>
      )}
    </>
  );
}
