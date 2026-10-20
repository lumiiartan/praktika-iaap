import {
  activePeriod,
  approvedHours,
  computeAlerts,
  dashboardStats,
  getRole,
  getState,
  visibleStudents,
} from "../store.js";
import { formatHours, formatNumber, formatPercent, fullName, statusLabel } from "../utils.js";

let charts = [];

function destroyCharts() {
  charts.forEach((chart) => chart.destroy());
  charts = [];
}

export function renderDashboard() {
  const db = getState();
  const role = getRole();
  const stats = dashboardStats(db);
  const alerts = computeAlerts(db).slice(0, 8);
  const period = activePeriod(db);

  if (role === "student") {
    const student = visibleStudents(role, db)[0];
    const hours = student ? approvedHours(student.id, period.id, db) : 0;
    const pct = period.requiredHours ? Math.min(100, (hours / period.requiredHours) * 100) : 0;
    return `
      <div class="page-head">
        <div>
          <h1>Paneli im</h1>
          <p class="muted">Përshëndetje, ${student ? fullName(student) : "nxënës"} · ${period.name}</p>
        </div>
      </div>
      <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))">
        <section class="card"><p class="muted">Orë të aprovuara</p><p style="font-size:1.8rem;font-weight:800">${formatHours(hours)}</p></section>
        <section class="card"><p class="muted">Kërkesa</p><p style="font-size:1.8rem;font-weight:800">${formatHours(period.requiredHours)}</p></section>
        <section class="card"><p class="muted">Progresi</p><p style="font-size:1.8rem;font-weight:800">${formatPercent(pct)}</p><div class="progress" style="margin-top:.6rem"><span style="width:${pct}%"></span></div></section>
      </div>
      <section class="card" style="margin-top:1rem">
        <h2>Hapi i radhës</h2>
        <p class="muted" style="margin-top:.4rem">Plotësoni ditarin e sotëm dhe prisni miratimin e mentorit në biznes.</p>
        <p style="margin-top:1rem"><a class="btn" href="#/ditari">Hap ditarin</a></p>
      </section>`;
  }

  if (role === "company") {
    const mine = visibleStudents(role, db);
    const pending = db.logEntries.filter((e) => e.status === "derguar" && mine.some((s) => s.id === e.studentId));
    return `
      <div class="page-head"><div><h1>Paneli i mentorit në biznes</h1><p class="muted">${mine.length} nxënës · ${pending.length} shënime në pritje</p></div></div>
      <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))">
        <section class="card"><p class="muted">Nxënës te ju</p><p style="font-size:1.8rem;font-weight:800">${mine.length}</p></section>
        <section class="card"><p class="muted">Për miratim</p><p style="font-size:1.8rem;font-weight:800">${pending.length}</p></section>
      </div>
      <section class="card" style="margin-top:1rem">
        <h2>Veprimi i shpejtë</h2>
        <p class="muted" style="margin-top:.4rem">Aprovoni javën me një klik nga pamja javorë.</p>
        <p style="margin-top:1rem"><a class="btn" href="#/ditari">Hap ditarin javor</a></p>
      </section>`;
  }

  const title = role === "director" ? "Paneli i drejtorit" : role === "school_mentor" ? "Paneli i mentorit të shkollës" : "Paneli i praktikës";

  return `
    <div class="page-head">
      <div>
        <h1>${title}</h1>
        <p class="muted">${period.name} · të dhëna të gjalla nga demo-ja</p>
      </div>
    </div>
    <div class="kpi-grid">
      <section class="card kpi-card"><p class="muted">Në praktikë</p><p style="font-size:1.6rem;font-weight:800">${stats.inPractice}</p></section>
      <section class="card kpi-card"><p class="muted">Pa vend</p><p style="font-size:1.6rem;font-weight:800">${stats.unplaced}</p></section>
      <section class="card kpi-card"><p class="muted">Biznese aktive</p><p style="font-size:1.6rem;font-weight:800">${stats.activeBusinesses}</p></section>
      <section class="card kpi-card"><p class="muted">Orë të regjistruara</p><p style="font-size:1.6rem;font-weight:800">${formatNumber(stats.approvedHours)}</p></section>
      <section class="card kpi-card"><p class="muted">% e orëve</p><p style="font-size:1.6rem;font-weight:800">${formatPercent(stats.completionPct)}</p></section>
      <section class="card kpi-card"><p class="muted">Vlerësimi mesatar</p><p style="font-size:1.6rem;font-weight:800">${stats.avgRating.toFixed(1)}</p></section>
    </div>
    <div class="grid-2" style="margin-top:1rem">
      <section class="card">
        <h2>Sinjalizimet</h2>
        <div class="alert-list" style="margin-top:.75rem">
          ${alerts.length ? alerts.map((a) => `
            <a class="alert-item ${a.tone}" href="${a.href}">
              <strong>${a.title}</strong>
              <span>${a.text}</span>
            </a>`).join("") : `<p class="empty">Nuk ka sinjalizime për momentin.</p>`}
        </div>
      </section>
      <section class="card">
        <h2>Nxënës sipas drejtimit</h2>
        <canvas id="chart-drejtim" height="220" aria-label="Grafiku i nxënësve sipas drejtimit"></canvas>
      </section>
      <section class="card">
        <h2>Statusi i vendosjes</h2>
        <canvas id="chart-status" height="220" aria-label="Grafiku i statusit"></canvas>
      </section>
      <section class="card">
        <h2>Biznese sipas sektorit</h2>
        <canvas id="chart-sector" height="220" aria-label="Grafiku i bizneseve"></canvas>
      </section>
    </div>
    ${role === "school_mentor" ? mentorBlock(db) : ""}
  `;
}

function mentorBlock(db) {
  const mine = visibleStudents("school_mentor", db);
  return `<section class="card" style="margin-top:1rem"><h2>Nxënësit e mi</h2>
    <div class="table-wrap" style="margin-top:.6rem"><table class="data"><thead><tr><th>Nxënësi</th><th>Klasa</th><th>Statusi</th></tr></thead>
    <tbody>${mine.slice(0, 8).map((s) => `<tr><td>${fullName(s)}</td><td>${s.className}</td><td>${statusLabel(s.status)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

export function bindDashboard() {
  destroyCharts();
  if (typeof Chart === "undefined") return;
  const db = getState();
  const byDrejtim = db.drejtimet.map((d) => ({
    label: d.code,
    value: db.students.filter((s) => s.drejtimId === d.id).length,
    color: d.color,
  }));
  const statuses = ["pa_vend", "ne_praktike", "perfunduar", "i_vendosur"];
  const statusCounts = statuses.map((status) => db.students.filter((s) => s.status === status).length);
  const sectors = {};
  db.businesses.forEach((b) => { sectors[b.sector] = (sectors[b.sector] || 0) + 1; });

  const make = (id, config) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    charts.push(new Chart(canvas, config));
  };

  make("chart-drejtim", {
    type: "bar",
    data: {
      labels: byDrejtim.map((d) => d.label),
      datasets: [{ data: byDrejtim.map((d) => d.value), backgroundColor: byDrejtim.map((d) => d.color) }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
  make("chart-status", {
    type: "doughnut",
    data: {
      labels: statuses.map(statusLabel),
      datasets: [{ data: statusCounts, backgroundColor: ["#b42318", "#0f3a67", "#1a7a4c", "#d8ab3f"] }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });
  make("chart-sector", {
    type: "bar",
    data: {
      labels: Object.keys(sectors),
      datasets: [{ data: Object.values(sectors), backgroundColor: "#0f3a67" }],
    },
    options: { indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
}
