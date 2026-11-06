const STORAGE_KEY = "theme_color";

export const DEFAULT_THEME = "#141416";

export const THEME_PRESETS = [
  { value: DEFAULT_THEME, label: "Hitam" },
  { value: "#ff0000", label: "Merah" },
  { value: "#a43cff", label: "Violet" },
  { value: "#2f6bff", label: "Biru" },
  { value: "#00a389", label: "Teal" },
  { value: "#ff6a00", label: "Oranye" },
  { value: "#f0359a", label: "Pink" },
];

const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value ?? "");

/** Warna teks di atas warna tema: hitam untuk warna terang, putih untuk warna lain. */
function contrastColor(hex) {
  const channel = (start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return luminance > 0.4 ? "#141416" : "#ffffff";
}

export function getTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isHexColor(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Seluruh palet di index.css diturunkan dari --brand. */
export function applyTheme(color) {
  document.documentElement.style.setProperty("--brand", color);
  document.documentElement.style.setProperty("--brand-on", contrastColor(color));
}

export function saveTheme(color) {
  applyTheme(color);
  try {
    localStorage.setItem(STORAGE_KEY, color);
  } catch {
    // Tema tetap berlaku sampai halaman dimuat ulang.
  }
}
