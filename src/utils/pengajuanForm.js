let nextItemKey = 1;

// `key` hanya untuk React dan tidak ikut dikirim ke API.
export const emptyItem = () => ({ key: nextItemKey++, keterangan: "", unit: "", harga_satuan: "", jumlah: "" });

/** Harga: hanya angka bulat, disimpan tanpa pemisah ribuan. */
export const sanitizeHarga = (value) => {
  const digits = String(value).replace(/\D/g, "").slice(0, 15).replace(/^0+(?=\d)/, "");
  return digits;
};

export const formatRibuan = (digits) =>
  digits === "" ? "" : new Intl.NumberFormat("id-ID").format(Number(digits));

/** Jumlah: boleh desimal (mis. 1,5), koma dan titik dianggap pemisah desimal. */
export const sanitizeJumlah = (value) => {
  const [head, ...rest] = String(value).replace(/,/g, ".").replace(/[^\d.]/g, "").split(".");
  return rest.length ? `${head}.${rest.join("").slice(0, 3)}` : head;
};

const toNumber = (text) => (text === "" || text === "." ? NaN : Number(text));

export function itemTotal(item) {
  const total = toNumber(item.harga_satuan) * toNumber(item.jumlah);
  return Number.isFinite(total) ? total : 0;
}

export const grandTotal = (items) => items.reduce((sum, item) => sum + itemTotal(item), 0);

function isValidDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(+match[1], +match[2] - 1, +match[3]);
  return date.getFullYear() === +match[1] && date.getMonth() === +match[2] - 1 && date.getDate() === +match[3];
}

/** Mengembalikan peta kesalahan { field: pesan }; kosong berarti valid. */
export function validateForm(form) {
  const errors = {};
  // Urutan mengikuti tampilan: field salah pertama yang akan difokuskan.
  if (!form.nama_pekerjaan.trim()) errors.nama_pekerjaan = "Nama pekerjaan wajib diisi.";
  if (!isValidDate(form.tanggal_request)) errors.tanggal_request = "Tanggal pengajuan wajib diisi dengan benar.";
  if (!form.id_departemen) errors.id_departemen = "Departemen wajib dipilih.";

  form.items.forEach((item, index) => {
    const key = (field) => `items.${index}.${field}`;
    if (!item.keterangan.trim()) errors[key("keterangan")] = "Keterangan wajib diisi.";
    const jumlah = toNumber(item.jumlah);
    if (Number.isNaN(jumlah)) errors[key("jumlah")] = "Jumlah wajib diisi.";
    else if (jumlah <= 0) errors[key("jumlah")] = "Jumlah harus lebih dari 0.";
    if (!item.unit.trim()) errors[key("unit")] = "Unit wajib diisi.";
    const harga = toNumber(item.harga_satuan);
    if (Number.isNaN(harga)) errors[key("harga_satuan")] = "Harga wajib diisi.";
    else if (harga < 0) errors[key("harga_satuan")] = "Harga tidak boleh negatif.";
  });
  return errors;
}

/** Membentuk body POST; field opsional yang kosong tidak dikirim. */
export function buildPayload(form) {
  const payload = {
    tanggal_request: form.tanggal_request,
    id_departemen: Number(form.id_departemen),
    nama_pekerjaan: form.nama_pekerjaan.trim(),
    priority: form.priority,
    items: form.items.map((item) => ({
      keterangan: item.keterangan.trim(),
      unit: item.unit.trim(),
      harga_satuan: Number(item.harga_satuan),
      jumlah: Number(item.jumlah),
    })),
  };
  [
    "note",
    "payment_description",
    "payment_bank",
    "payment_account_number",
    "payment_account_name",
    "attachment_name",
    "attachment_path",
  ].forEach((field) => {
    const value = form[field]?.trim();
    if (value) payload[field] = value;
  });
  return payload;
}
