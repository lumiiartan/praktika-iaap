const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];

export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}.${MONTHS[d.getMonth()]}.${d.getFullYear()}`;
}

export function formatHours(value) {
  const n = Math.round(Number(value) || 0);
  return `${n} orë`;
}

export function formatNumber(value) {
  return String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

export function todayIso() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  const start = new Date(`${a}T12:00:00`).getTime();
  const end = new Date(`${b}T12:00:00`).getTime();
  return Math.floor((end - start) / 86400000);
}

export function hoursBetween(startTime, endTime) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function downloadText(filename, text, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCsv(rows) {
  return rows.map((row) => row.map((cell) => {
    const value = String(cell ?? "");
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(",")).join("\n");
}

export function fullName(person) {
  return `${person.firstName} ${person.lastName}`;
}

export function statusLabel(status) {
  const map = {
    pa_vend: "Pa vend",
    i_vendosur: "I vendosur",
    ne_praktike: "Në praktikë",
    perfunduar: "Përfunduar",
    draft: "Draft",
    derguar: "Dërguar",
    aprovuar: "Aprovuar",
    kthyer: "Kthyer për korrigjim",
    active: "Aktive",
    completed: "Përfunduar",
    planned: "Planifikuar",
    valide: "E vlefshme",
    skaduar: "E skaduar",
    ne_skadim: "Afër skadimit",
  };
  return map[status] ?? status;
}

export function statusTone(status) {
  if (["aprovuar", "perfunduar", "valide", "ne_praktike", "completed"].includes(status)) return "ok";
  if (["derguar", "i_vendosur", "ne_skadim", "planned", "draft"].includes(status)) return "warn";
  if (["kthyer", "pa_vend", "skaduar"].includes(status)) return "danger";
  return "info";
}

export function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query = ""] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(query));
  return { parts, params, path: parts.join("/") };
}

export function navigate(path) {
  location.hash = `#/${path.replace(/^\//, "")}`;
}

export function el(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}
