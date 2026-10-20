import {
  activePeriod,
  approvedHours,
  getRole,
  getState,
  placementForStudent,
} from "../store.js";
import { downloadText, formatDate, formatHours, formatNumber, formatPercent, fullName, toCsv } from "../utils.js";

export function renderReports(params) {
  const db = getState();
  const role = getRole();
  const view = params.view || "menu";
  if (view === "vertetim") return renderCertificate(params.student);
  if (view === "donatore") return renderDonor();
  if (view === "drejtim") return renderByDrejtim();
  if (view === "biznes") return renderByBusiness();

  return `
    <div class="page-head">
      <div>
        <h1>Raportet</h1>
        <p class="muted">Vërtetime, përmbledhje dhe eksport CSV</p>
      </div>
    </div>
    <div class="grid-2">
      <a class="card" href="#/raportet?view=vertetim" style="color:inherit;text-decoration:none">
        <h2>Vërtetim i praktikës</h2>
        <p class="muted" style="margin-top:.4rem">Certifikatë A4 me orë dhe firmë</p>
      </a>
      <a class="card" href="#/raportet?view=donatore" style="color:inherit;text-decoration:none">
        <h2>Raport për donatorë</h2>
        <p class="muted" style="margin-top:.4rem">Numra të anonimizuar për grant</p>
      </a>
      <a class="card" href="#/raportet?view=drejtim" style="color:inherit;text-decoration:none">
        <h2>Raport sipas drejtimit</h2>
        <p class="muted" style="margin-top:.4rem">Vendosje dhe orë për çdo profil</p>
      </a>
      <a class="card" href="#/raportet?view=biznes" style="color:inherit;text-decoration:none">
        <h2>Raport sipas biznesit</h2>
        <p class="muted" style="margin-top:.4rem">Kapaciteti dhe nxënësit</p>
      </a>
    </div>
    ${role === "coordinator" || role === "director" ? `
      <section class="card" style="margin-top:1rem">
        <h2>Eksport CSV</h2>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem">
          <button class="btn secondary" type="button" id="csv-students">Nxënësit</button>
          <button class="btn secondary" type="button" id="csv-businesses">Bizneset</button>
          <button class="btn secondary" type="button" id="csv-placements">Vendosjet</button>
        </div>
      </section>` : ""}`;
}

function renderCertificate(studentId) {
  const db = getState();
  const period = db.periods.find((p) => p.status === "completed") || activePeriod(db);
  const candidates = db.students.filter((s) => placementForStudent(s.id, period.id, db));
  const student = db.students.find((s) => s.id === studentId) || candidates[0];
  if (!student) return `<p class="card">Nuk ka nxënës me vendosje.</p>`;
  const placement = placementForStudent(student.id, period.id, db);
  const business = db.businesses.find((b) => b.id === placement?.businessId);
  const hours = approvedHours(student.id, period.id, db) || period.requiredHours;
  const evals = db.evaluations.find((e) => e.studentId === student.id && e.by === "company");
  const avg = evals ? Object.values(evals.criteria).reduce((a, b) => a + b, 0) / Object.values(evals.criteria).length : null;

  return `
    <div class="page-head no-print">
      <div>
        <h1>Vërtetim për kryerjen e praktikës</h1>
        <form id="cert-pick" class="filters" style="margin-top:.75rem">
          <div class="field"><label>Nxënësi</label>
            <select class="control" name="student">${candidates.map((s) => `<option value="${s.id}" ${s.id === student.id ? "selected" : ""}>${fullName(s)}</option>`).join("")}</select>
          </div>
          <div class="field"><label>&nbsp;</label><button class="btn secondary" type="submit">Ndrysho</button></div>
        </form>
      </div>
      <button class="btn" type="button" onclick="window.print()">Printo</button>
    </div>
    <article class="print-sheet card">
      <div style="display:flex;align-items:center;gap:1rem;justify-content:center">
        <img src="./assets/logo-school.jpg" alt="" width="64" height="64" style="border-radius:50%" />
        <div>
          <p class="school">${db.meta.school}</p>
          <p class="muted">${db.meta.municipality} · Qendra e Karrierës</p>
        </div>
      </div>
      <div class="accent-line" aria-hidden="true"></div>
      <h1 style="text-align:center">Vërtetim</h1>
      <p style="margin-top:1.25rem">Me këtë vërtetohet se nxënësi/ja <strong>${fullName(student)}</strong>, klasa ${student.className}, ka kryer praktikën profesionale te <strong>${business?.name ?? "—"}</strong> gjatë periudhës <strong>${period.name}</strong>.</p>
      <p style="margin-top:1rem">Orë të njohura: <strong>${formatHours(hours)}</strong><br/>Nota përfundimtare: <strong>${avg ? avg.toFixed(1) : "—"}</strong></p>
      <p style="margin-top:1rem">Data: ${formatDate(db.meta.demoDate)}</p>
      <div class="sign-row">
        <div class="sign-line">Mentori në biznes</div>
        <div class="sign-line">Koordinatori i praktikës</div>
        <div class="sign-line">Drejtori</div>
      </div>
      <p class="muted" style="margin-top:2rem;font-size:.85rem">Demo – të dhëna fiktive. Nuk është dokument zyrtar.</p>
    </article>`;
}

function renderDonor() {
  const db = getState();
  const period = activePeriod(db);
  const placed = db.placements.filter((p) => p.periodId === period.id).length;
  const hours = db.logEntries.filter((e) => e.status === "aprovuar").reduce((sum, e) => sum + e.hours, 0);
  const villages = new Set(db.students.filter((s) => s.status === "ne_praktike").map((s) => s.village));
  const girlsTech = db.students.filter((s) => s.gender === "F" && ["tik", "elektro", "mekanike", "ndertimtari"].includes(s.drejtimId));
  const techTotal = db.students.filter((s) => ["tik", "elektro", "mekanike", "ndertimtari"].includes(s.drejtimId));
  const studentFeedback = db.evaluations.filter((e) => e.by === "student");
  const sat = studentFeedback.length
    ? studentFeedback.reduce((sum, e) => sum + (e.criteria.biznesi || 0), 0) / studentFeedback.length
    : 0;
  const sectors = {};
  db.businesses.forEach((b) => { sectors[b.sector] = (sectors[b.sector] || 0) + 1; });

  return `
    <div class="page-head no-print">
      <div><h1>Raport për donatorë</h1><p class="muted">Vetëm numra të agreguar, pa emra</p></div>
      <button class="btn" type="button" onclick="window.print()">Printo / PDF</button>
    </div>
    <article class="print-sheet card">
      <p class="school">${db.meta.school}</p>
      <h1 style="margin-top:1rem">Përmbledhje për partnerë dhe donatorë</h1>
      <p class="muted">Periudha aktive: ${period.name}</p>
      <div class="kpi-grid" style="margin-top:1.25rem;grid-template-columns:repeat(2,minmax(0,1fr))">
        <section class="card"><p class="muted">Nxënës të vendosur</p><p style="font-size:1.8rem;font-weight:800">${placed}</p></section>
        <section class="card"><p class="muted">Orë të aprovuara</p><p style="font-size:1.8rem;font-weight:800">${formatNumber(hours)}</p></section>
        <section class="card"><p class="muted">Fshatra / zona të arritura</p><p style="font-size:1.8rem;font-weight:800">${villages.size}</p></section>
        <section class="card"><p class="muted">Vajza në profile teknike</p><p style="font-size:1.8rem;font-weight:800">${formatPercent(techTotal.length ? (girlsTech.length / techTotal.length) * 100 : 0)}</p></section>
        <section class="card"><p class="muted">Kënaqësia mesatare</p><p style="font-size:1.8rem;font-weight:800">${sat.toFixed(1)} / 5</p></section>
        <section class="card"><p class="muted">Biznese partnere</p><p style="font-size:1.8rem;font-weight:800">${db.businesses.length}</p></section>
      </div>
      <h2 style="margin-top:1.5rem">Sektorët</h2>
      <ul>${Object.entries(sectors).map(([k, v]) => `<li>${k}: ${v}</li>`).join("")}</ul>
      <p class="muted" style="margin-top:1.5rem">Ky raport nuk përmban emra, numra personalë apo adresa. Të dhënat janë fiktive në demo.</p>
    </article>`;
}

function renderByDrejtim() {
  const db = getState();
  const period = activePeriod(db);
  const rows = db.drejtimet.map((d) => {
    const students = db.students.filter((s) => s.drejtimId === d.id);
    const placed = students.filter((s) => s.status === "ne_praktike" || s.status === "perfunduar").length;
    return { name: d.name, total: students.length, placed, note: d.note };
  });
  return `
    <div class="page-head"><div><h1>Raport sipas drejtimit</h1><p class="muted">${period.name}</p></div><a class="btn secondary" href="#/raportet">Kthehu</a></div>
    <section class="card table-wrap"><table class="data"><thead><tr><th>Drejtimi</th><th>Nxënës</th><th>Të vendosur</th><th>Shënim</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${r.name}</td><td>${r.total}</td><td>${r.placed}</td><td class="muted">${r.note}</td></tr>`).join("")}</tbody></table></section>`;
}

function renderByBusiness() {
  const db = getState();
  const period = activePeriod(db);
  return `
    <div class="page-head"><div><h1>Raport sipas biznesit</h1></div><a class="btn secondary" href="#/raportet">Kthehu</a></div>
    <section class="card table-wrap"><table class="data"><thead><tr><th>Biznesi</th><th>Sektori</th><th>Vendosje aktive</th><th>Kapaciteti</th></tr></thead>
    <tbody>${db.businesses.map((b) => {
      const used = db.placements.filter((p) => p.businessId === b.id && p.periodId === period.id).length;
      return `<tr><td>${b.name}</td><td>${b.sector}</td><td>${used}</td><td>${b.capacity}</td></tr>`;
    }).join("")}</tbody></table></section>`;
}

export function bindReports() {
  document.getElementById("cert-pick")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = new FormData(event.target).get("student");
    location.hash = `#/raportet?view=vertetim&student=${id}`;
  });
  const db = getState();
  document.getElementById("csv-students")?.addEventListener("click", () => {
    downloadText("nxenesit.csv", toCsv([
      ["Emri", "Klasa", "Drejtimi", "Fshati", "Statusi"],
      ...db.students.map((s) => [fullName(s), s.className, s.drejtimId, s.village, s.status]),
    ]));
  });
  document.getElementById("csv-businesses")?.addEventListener("click", () => {
    downloadText("bizneset.csv", toCsv([
      ["Emri", "Sektori", "Vendndodhja", "Kapaciteti", "Marrëveshja"],
      ...db.businesses.map((b) => [b.name, b.sector, b.village, b.capacity, b.agreement.status]),
    ]));
  });
  document.getElementById("csv-placements")?.addEventListener("click", () => {
    downloadText("vendosjet.csv", toCsv([
      ["Nxënësi", "Biznesi", "Periudha", "Statusi"],
      ...db.placements.map((p) => {
        const s = db.students.find((x) => x.id === p.studentId);
        const b = db.businesses.find((x) => x.id === p.businessId);
        return [s ? fullName(s) : p.studentId, b?.name ?? "", p.periodId, p.status];
      }),
    ]));
  });
}
