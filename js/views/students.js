import {
  activePeriod,
  approvedHours,
  getRole,
  getState,
  placementForStudent,
  visibleStudents,
} from "../store.js";
import { formatHours, fullName, navigate, statusLabel, statusTone } from "../utils.js";

export function renderStudents(parts, params) {
  const db = getState();
  const role = getRole();
  if (parts[1]) return renderProfile(parts[1]);

  const q = (params.q || "").toLowerCase();
  const klasa = params.klasa || "";
  const drejtim = params.drejtimi || "";
  const status = params.statusi || "";

  let rows = visibleStudents(role, db);
  if (q) rows = rows.filter((s) => fullName(s).toLowerCase().includes(q) || s.className.includes(q));
  if (klasa) rows = rows.filter((s) => String(s.grade) === klasa);
  if (drejtim) rows = rows.filter((s) => s.drejtimId === drejtim);
  if (status) rows = rows.filter((s) => s.status === status);

  return `
    <div class="page-head">
      <div>
        <h1>${role === "school_mentor" || role === "company" ? "Nxënësit e mi" : "Nxënësit"}</h1>
        <p class="muted">${rows.length} nxënës · pa numër personal, vetëm fshati</p>
      </div>
    </div>
    <form class="card filters" id="stu-filters">
      <div class="field"><label>Kërko</label><input class="control" name="q" value="${params.q || ""}" placeholder="Emri ose klasa" /></div>
      <div class="field"><label>Klasa</label><select class="control" name="klasa"><option value="">Të gjitha</option>${[10,11,12].map((g) => `<option value="${g}" ${klasa === String(g) ? "selected" : ""}>${g}</option>`).join("")}</select></div>
      <div class="field"><label>Drejtimi</label><select class="control" name="drejtimi"><option value="">Të gjitha</option>${db.drejtimet.map((d) => `<option value="${d.id}" ${drejtim === d.id ? "selected" : ""}>${d.name}</option>`).join("")}</select></div>
      <div class="field"><label>Statusi</label><select class="control" name="statusi"><option value="">Të gjitha</option>${["pa_vend","i_vendosur","ne_praktike","perfunduar"].map((s) => `<option value="${s}" ${status === s ? "selected" : ""}>${statusLabel(s)}</option>`).join("")}</select></div>
      <div class="field"><label>&nbsp;</label><button class="btn secondary" type="submit">Filtro</button></div>
    </form>
    <section class="card table-wrap">
      <table class="data">
        <thead><tr><th>Nxënësi</th><th>Klasa</th><th>Drejtimi</th><th>Fshati</th><th>Statusi</th><th></th></tr></thead>
        <tbody>
          ${rows.map((s) => {
            const d = db.drejtimet.find((x) => x.id === s.drejtimId);
            return `<tr>
              <td><strong>${fullName(s)}</strong></td>
              <td>${s.className}</td>
              <td>${d?.name ?? ""}</td>
              <td>${s.village}</td>
              <td><span class="badge ${statusTone(s.status)}">${statusLabel(s.status)}</span></td>
              <td><a href="#/nxenesit/${s.id}">Profili</a></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </section>`;
}

function renderProfile(id) {
  const db = getState();
  const s = db.students.find((x) => x.id === id);
  if (!s) return `<p class="card">Nxënësi nuk u gjet.</p>`;
  const role = getRole();
  const allowed = visibleStudents(role, db).some((x) => x.id === id) || role === "coordinator" || role === "director";
  if (!allowed) return `<p class="card">Ky profil nuk është i dukshëm për rolin tuaj.</p>`;

  const period = activePeriod(db);
  const placement = placementForStudent(id, period.id, db);
  const business = placement ? db.businesses.find((b) => b.id === placement.businessId) : null;
  const hours = approvedHours(id, period.id, db);
  const pct = Math.min(100, (hours / period.requiredHours) * 100);
  const entries = db.logEntries.filter((e) => e.studentId === id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const evals = db.evaluations.filter((e) => e.studentId === id);
  const visits = db.visits.filter((v) => v.studentId === id);
  const drejtim = db.drejtimet.find((d) => d.id === s.drejtimId);

  return `
    <div class="page-head">
      <div>
        <p><a href="#/nxenesit">← Nxënësit</a></p>
        <h1>${fullName(s)}</h1>
        <p class="muted">${s.className} · ${drejtim?.name ?? ""} · ${s.village}</p>
      </div>
      <span class="badge ${statusTone(s.status)}">${statusLabel(s.status)}</span>
    </div>
    <div class="grid-2">
      <section class="card">
        <h2>Vendosja aktuale</h2>
        ${business ? `<p style="margin-top:.5rem"><strong>${business.name}</strong></p><p class="muted">${business.village}</p>` : `<p class="muted" style="margin-top:.5rem">Ende pa vend në periudhën aktive.</p>`}
        <p style="margin-top:1rem"><strong>Orët:</strong> ${formatHours(hours)} / ${formatHours(period.requiredHours)}</p>
        <div class="progress" style="margin-top:.5rem"><span style="width:${pct}%"></span></div>
      </section>
      <section class="card">
        <h2>Mentori i shkollës</h2>
        <p style="margin-top:.5rem">${(() => {
          const m = db.schoolMentors.find((x) => x.id === s.schoolMentorId);
          return m ? fullName(m) : "—";
        })()}</p>
        <p class="muted" style="margin-top:.8rem">${visits.length} vizita të regjistruara</p>
      </section>
    </div>
    <section class="card" style="margin-top:1rem">
      <h2>Ditari (të fundit)</h2>
      <div class="table-wrap" style="margin-top:.5rem">
        <table class="data"><thead><tr><th>Data</th><th>Orë</th><th>Statusi</th></tr></thead>
        <tbody>${entries.length ? entries.map((e) => `<tr><td>${e.date.split("-").reverse().join(".")}</td><td>${formatHours(e.hours)}</td><td><span class="badge ${statusTone(e.status)}">${statusLabel(e.status)}</span></td></tr>`).join("") : `<tr><td colspan="3" class="muted">Nuk ka shënime.</td></tr>`}</tbody></table>
      </div>
    </section>
    <section class="card" style="margin-top:1rem">
      <h2>Vlerësimet</h2>
      <p class="muted" style="margin-top:.4rem">${evals.filter((e) => e.by === "company").length} nga biznesi · ${evals.filter((e) => e.by === "student").length} nga nxënësi</p>
    </section>`;
}

export function bindStudents() {
  document.getElementById("stu-filters")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const q = new URLSearchParams();
    for (const [key, value] of data.entries()) if (value) q.set(key, String(value));
    navigate(`nxenesit?${q.toString()}`);
  });
}
