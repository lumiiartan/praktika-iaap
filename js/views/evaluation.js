import {
  getRole,
  getState,
  placementForStudent,
  activePeriod,
  saveEvaluation,
  saveVisit,
  visibleStudents,
} from "../store.js";
import { formatDate, fullName, todayIso } from "../utils.js";

const CRITERIA = [
  ["perpikeria", "Përpikëria"],
  ["siguria", "Siguria në punë"],
  ["teknike", "Aftësitë teknike"],
  ["ekip", "Puna në ekip"],
  ["komunikimi", "Komunikimi"],
  ["iniciativa", "Iniciativa"],
  ["rregullat", "Respektimi i rregullave"],
];

let radarChart = null;

export function renderEvaluation(params) {
  const db = getState();
  const role = getRole();
  const students = visibleStudents(role, db);
  const studentId = params.student || students[0]?.id || "";
  const student = db.students.find((s) => s.id === studentId);

  if (role === "school_mentor") return renderVisits(db, students, studentId);
  if (role === "student") return renderStudentView(db, students[0]);

  return `
    <div class="page-head">
      <div>
        <h1>Vlerësimi</h1>
        <p class="muted">Rubrika 1–5 nga mentori në biznes · feedback i nxënësit vetëm për koordinatorin</p>
      </div>
    </div>
    <form class="card filters" id="eval-pick">
      <div class="field"><label>Nxënësi</label>
        <select class="control" name="student">${students.map((s) => `<option value="${s.id}" ${s.id === studentId ? "selected" : ""}>${fullName(s)}</option>`).join("")}</select>
      </div>
      <div class="field"><label>&nbsp;</label><button class="btn secondary" type="submit">Shfaq</button></div>
    </form>
    ${student ? renderStudentEval(db, student, role) : `<p class="card">Zgjidhni një nxënës.</p>`}`;
}

function renderStudentEval(db, student, role) {
  const period = activePeriod(db);
  const placement = placementForStudent(student.id, period.id, db)
    || db.placements.filter((p) => p.studentId === student.id).at(-1);
  const companyEval = db.evaluations.find((e) => e.studentId === student.id && e.by === "company");
  const studentFeedback = db.evaluations.find((e) => e.studentId === student.id && e.by === "student");

  return `
    <div class="grid-2">
      <section class="card">
        <h2>${fullName(student)}</h2>
        <canvas id="radar-eval" height="240" aria-label="Radar i vlerësimit"></canvas>
        ${companyEval ? `<p class="muted" style="margin-top:.5rem">Data: ${formatDate(companyEval.date)} · ${companyEval.comment}</p>` : `<p class="muted" style="margin-top:.5rem">Nuk ka vlerësim përfundimtar ende.</p>`}
      </section>
      <section class="card">
        ${role === "company" ? `
          <h2>Plotëso vlerësimin</h2>
          <form id="eval-form" style="display:grid;gap:.65rem;margin-top:.75rem">
            <input type="hidden" name="studentId" value="${student.id}" />
            <input type="hidden" name="placementId" value="${placement?.id || ""}" />
            ${CRITERIA.map(([key, label]) => `
              <div class="field"><label>${label}</label>
                <select class="control" name="${key}" required>
                  ${[1,2,3,4,5].map((n) => `<option value="${n}" ${companyEval?.criteria?.[key] === n ? "selected" : ""}>${n}</option>`).join("")}
                </select>
              </div>`).join("")}
            <div class="field"><label>Komenti</label><textarea class="control" name="comment">${companyEval?.comment || ""}</textarea></div>
            <button class="btn" type="submit">Ruaj vlerësimin</button>
          </form>` : `
          <h2>Detajet</h2>
          <ul style="margin:.75rem 0 0;padding-left:1.1rem">
            ${CRITERIA.map(([key, label]) => `<li>${label}: <strong>${companyEval?.criteria?.[key] ?? "—"}</strong></li>`).join("")}
          </ul>`}
        ${role === "coordinator" && studentFeedback ? `
          <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)">
            <h3>Feedback i nxënësit (vetëm koordinatori)</h3>
            <p style="margin-top:.4rem">Nota për biznesin: <strong>${studentFeedback.criteria.biznesi}/5</strong></p>
            <p class="muted">${studentFeedback.comment}</p>
          </div>` : ""}
      </section>
    </div>`;
}

function renderStudentView(db, student) {
  if (!student) return `<p class="card">Nuk u gjet nxënësi.</p>`;
  const companyEval = db.evaluations.find((e) => e.studentId === student.id && e.by === "company");
  return `
    <div class="page-head"><div><h1>Vlerësimet e mia</h1><p class="muted">${fullName(student)}</p></div></div>
    <section class="card">
      ${companyEval ? `<p>Vlerësimi nga mentori në biznes është i regjistruar (${formatDate(companyEval.date)}).</p>
        <canvas id="radar-eval" height="240" style="margin-top:1rem"></canvas>
        <p class="muted" style="margin-top:.75rem">${companyEval.comment}</p>` : `<p class="muted">Ende nuk ka vlerësim përfundimtar.</p>`}
    </section>`;
}

function renderVisits(db, students, studentId) {
  const visits = db.visits.filter((v) => students.some((s) => s.id === v.studentId));
  return `
    <div class="page-head">
      <div><h1>Vizitat e mentorit të shkollës</h1><p class="muted">${visits.length} vizita</p></div>
    </div>
    <form class="card" id="visit-form" style="display:grid;gap:.65rem">
      <h2>Regjistro vizitë</h2>
      <div class="field"><label>Nxënësi</label>
        <select class="control" name="studentId">${students.map((s) => `<option value="${s.id}" ${s.id === studentId ? "selected" : ""}>${fullName(s)}</option>`).join("")}</select>
      </div>
      <div class="field"><label>Data</label><input class="control" type="date" name="date" value="${todayIso()}" required /></div>
      <div class="field"><label>Vërejtjet</label><textarea class="control" name="notes" required></textarea></div>
      <div class="field"><label>Rekomandimet</label><textarea class="control" name="recommendations"></textarea></div>
      <button class="btn" type="submit">Ruaj vizitën</button>
    </form>
    <section class="card table-wrap" style="margin-top:1rem">
      <table class="data"><thead><tr><th>Data</th><th>Nxënësi</th><th>Vërejtjet</th></tr></thead>
      <tbody>${visits.map((v) => {
        const s = db.students.find((x) => x.id === v.studentId);
        return `<tr><td>${formatDate(v.date)}</td><td>${s ? fullName(s) : ""}</td><td>${v.notes}</td></tr>`;
      }).join("") || `<tr><td colspan="3" class="muted">Nuk ka vizita.</td></tr>`}</tbody></table>
    </section>`;
}

export function bindEvaluation() {
  document.getElementById("eval-pick")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = new FormData(event.target).get("student");
    location.hash = `#/vleresimi?student=${id}`;
  });

  document.getElementById("eval-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const criteria = Object.fromEntries(CRITERIA.map(([key]) => [key, Number(data.get(key))]));
    saveEvaluation({
      studentId: String(data.get("studentId")),
      placementId: String(data.get("placementId")),
      by: "company",
      criteria,
      comment: String(data.get("comment") || ""),
      date: todayIso(),
    });
    location.hash = `#/vleresimi?student=${data.get("studentId")}`;
  });

  document.getElementById("visit-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const db = getState();
    const studentId = String(data.get("studentId"));
    const student = db.students.find((s) => s.id === studentId);
    const period = activePeriod(db);
    const placement = placementForStudent(studentId, period.id, db);
    saveVisit({
      schoolMentorId: student?.schoolMentorId,
      studentId,
      businessId: placement?.businessId,
      date: String(data.get("date")),
      notes: String(data.get("notes")),
      recommendations: String(data.get("recommendations") || ""),
      status: "kryer",
    });
    location.hash = "#/vleresimi";
  });

  if (radarChart) {
    radarChart.destroy();
    radarChart = null;
  }
  const canvas = document.getElementById("radar-eval");
  if (!canvas || typeof Chart === "undefined") return;
  const db = getState();
  const params = Object.fromEntries(new URLSearchParams(location.hash.split("?")[1] || ""));
  const role = getRole();
  const students = visibleStudents(role, db);
  const student = db.students.find((s) => s.id === (params.student || students[0]?.id || db.users.demoStudentId));
  const companyEval = student && db.evaluations.find((e) => e.studentId === student.id && e.by === "company");
  if (!companyEval) return;
  radarChart = new Chart(canvas, {
    type: "radar",
    data: {
      labels: CRITERIA.map(([, label]) => label),
      datasets: [{
        label: "Vlerësimi",
        data: CRITERIA.map(([key]) => companyEval.criteria[key]),
        backgroundColor: "rgba(216,171,63,.25)",
        borderColor: "#0f3a67",
      }],
    },
    options: { scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } },
  });
}
