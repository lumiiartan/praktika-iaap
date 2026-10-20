import {
  activePeriod,
  getRole,
  getState,
  placementForStudent,
  saveLogEntry,
  setLogStatus,
  visibleStudents,
} from "../store.js";
import { formatDate, formatHours, fullName, hoursBetween, statusLabel, statusTone, todayIso } from "../utils.js";

export function renderLogbook(params) {
  const db = getState();
  const role = getRole();
  const period = activePeriod(db);
  const students = visibleStudents(role, db).filter((s) => s.status === "ne_praktike" || role === "student");

  if (role === "student") {
    return renderStudentLog(db, students[0], period);
  }
  if (role === "company") {
    return renderCompanyWeek(db, students, period);
  }

  const studentId = params.student || students[0]?.id || "";
  const student = students.find((s) => s.id === studentId) || db.students.find((s) => s.id === studentId);
  const entries = student
    ? db.logEntries.filter((e) => e.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return `
    <div class="page-head">
      <div>
        <h1>Ditari digjital i praktikës</h1>
        <p class="muted">${period.name}</p>
      </div>
    </div>
    <form class="card filters" id="log-pick">
      <div class="field"><label>Nxënësi</label>
        <select class="control" name="student">
          ${students.map((s) => `<option value="${s.id}" ${s.id === studentId ? "selected" : ""}>${fullName(s)} · ${s.className}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>&nbsp;</label><button class="btn secondary" type="submit">Shfaq</button></div>
    </form>
    ${student ? `
      <section class="card table-wrap">
        <h2>${fullName(student)}</h2>
        <table class="data" style="margin-top:.6rem">
          <thead><tr><th>Data</th><th>Orari</th><th>Orë</th><th>Statusi</th><th>Aktivitetet</th></tr></thead>
          <tbody>
            ${entries.map((e) => `<tr>
              <td>${formatDate(e.date)}</td>
              <td>${e.startTime}–${e.endTime}</td>
              <td>${formatHours(e.hours)}</td>
              <td><span class="badge ${statusTone(e.status)}">${statusLabel(e.status)}</span></td>
              <td>${e.activities.slice(0, 80)}${e.activities.length > 80 ? "…" : ""}</td>
            </tr>`).join("") || `<tr><td colspan="5" class="muted">Nuk ka shënime.</td></tr>`}
          </tbody>
        </table>
      </section>` : `<p class="card">Zgjidhni një nxënës.</p>`}`;
}

function renderStudentLog(db, student, period) {
  if (!student) return `<p class="card">Nxënësi demo nuk u gjet. Rivendosni demon.</p>`;
  const placement = placementForStudent(student.id, period.id, db);
  const drejtim = db.drejtimet.find((d) => d.id === student.drejtimId);
  const entries = db.logEntries.filter((e) => e.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  const approved = entries.filter((e) => e.status === "aprovuar").reduce((sum, e) => sum + e.hours, 0);
  const pct = Math.min(100, (approved / period.requiredHours) * 100);
  const demoDay = db.meta.demoDate || todayIso();

  return `
    <div class="page-head">
      <div>
        <h1>Ditari im</h1>
        <p class="muted">${fullName(student)} · ${formatHours(approved)} / ${formatHours(period.requiredHours)}</p>
      </div>
    </div>
    <div class="progress" style="margin-bottom:1rem"><span style="width:${pct}%"></span></div>
    <form class="card" id="log-form" style="display:grid;gap:.75rem">
      <h2>Shënim i ri</h2>
      <div class="grid-2">
        <div class="field"><label>Data</label><input class="control" type="date" name="date" required value="${demoDay}" /></div>
        <div class="field"><label>Ora e fillimit</label><input class="control" type="time" name="startTime" required value="08:00" /></div>
        <div class="field"><label>Ora e mbarimit</label><input class="control" type="time" name="endTime" required value="14:00" /></div>
        <div class="field"><label>Foto (opsionale)</label><label class="btn secondary" style="justify-content:flex-start"><input type="checkbox" name="photo" /> Vendos placeholder foto</label></div>
      </div>
      <div class="field"><label>Aktivitetet e kryera</label><textarea class="control" name="activities" required placeholder="Përshkruani shkurt çfarë keni bërë"></textarea></div>
      <div class="field"><label>Aftësitë e praktikuara</label>
        <div class="chips">${(drejtim?.skills || []).map((skill) => `
          <label class="badge"><input type="checkbox" name="skills" value="${skill}" /> ${skill}</label>`).join("")}</div>
      </div>
      <div class="field"><label>Probleme / pyetje</label><textarea class="control" name="problems"></textarea></div>
      <input type="hidden" name="studentId" value="${student.id}" />
      <input type="hidden" name="placementId" value="${placement?.id || ""}" />
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn secondary" type="submit" name="intent" value="draft">Ruaj draft</button>
        <button class="btn" type="submit" name="intent" value="derguar">Dërgo te mentori</button>
      </div>
      <p id="log-msg" class="muted" role="status"></p>
    </form>
    <section class="card" style="margin-top:1rem">
      <h2>Shënimet e mia</h2>
      <div class="table-wrap" style="margin-top:.5rem">
        <table class="data"><thead><tr><th>Data</th><th>Orë</th><th>Statusi</th><th>Komenti</th></tr></thead>
        <tbody>${entries.slice(0, 10).map((e) => `<tr><td>${formatDate(e.date)}</td><td>${formatHours(e.hours)}</td><td><span class="badge ${statusTone(e.status)}">${statusLabel(e.status)}</span></td><td>${e.mentorComment || "—"}</td></tr>`).join("")}</tbody></table>
      </div>
    </section>`;
}

function renderCompanyWeek(db, students, period) {
  const pending = db.logEntries.filter((e) => e.status === "derguar" && students.some((s) => s.id === e.studentId));
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(`${db.meta.demoDate}T12:00:00`);
    d.setDate(d.getDate() - d.getDay() + 1 + i);
    days.push(d.toISOString().slice(0, 10));
  }

  return `
    <div class="page-head">
      <div>
        <h1>Ditari javor</h1>
        <p class="muted">${students.length} nxënës · ${pending.length} shënime në pritje</p>
      </div>
      <button class="btn" type="button" id="approve-week" ${pending.length ? "" : "disabled"}>Aprovo javën (${pending.length})</button>
    </div>
    <section class="card">
      <div class="week-grid" aria-label="Java aktuale">
        ${days.map((date) => {
          const dayEntries = pending.filter((e) => e.date === date);
          const any = db.logEntries.filter((e) => e.date === date && students.some((s) => s.id === e.studentId));
          const tone = any.some((e) => e.status === "aprovuar") ? "approved"
            : any.some((e) => e.status === "derguar") ? "pending"
            : any.some((e) => e.status === "kthyer") ? "rejected"
            : any.length ? "draft" : "";
          return `<div class="week-day ${tone}"><strong>${formatDate(date).slice(0, 5)}</strong><div>${any.length} shënime</div><div class="muted">${dayEntries.length} në pritje</div></div>`;
        }).join("")}
      </div>
    </section>
    <section class="card table-wrap" style="margin-top:1rem">
      <h2>Për miratim</h2>
      <table class="data" style="margin-top:.5rem">
        <thead><tr><th>Nxënësi</th><th>Data</th><th>Orë</th><th>Aktivitetet</th></tr></thead>
        <tbody>
          ${pending.map((e) => {
            const s = db.students.find((x) => x.id === e.studentId);
            return `<tr><td>${s ? fullName(s) : ""}</td><td>${formatDate(e.date)}</td><td>${formatHours(e.hours)}</td><td>${e.activities}</td></tr>`;
          }).join("") || `<tr><td colspan="4" class="muted">Asgjë në pritje. Mirë!</td></tr>`}
        </tbody>
      </table>
    </section>
    <p id="log-msg" class="muted" style="margin-top:.75rem" role="status"></p>`;
}

export function bindLogbook() {
  document.getElementById("log-pick")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = new FormData(event.target).get("student");
    location.hash = `#/ditari?student=${id}`;
  });

  document.getElementById("approve-week")?.addEventListener("click", () => {
    const db = getState();
    const role = getRole();
    const students = visibleStudents(role, db);
    const pendingIds = db.logEntries
      .filter((e) => e.status === "derguar" && students.some((s) => s.id === e.studentId))
      .map((e) => e.id);
    setLogStatus(pendingIds, "aprovuar", "Aprovuar nga mentori në biznes.");
  });

  const form = document.getElementById("log-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const intent = event.submitter?.value || "draft";
    const startTime = String(data.get("startTime"));
    const endTime = String(data.get("endTime"));
    const activities = String(data.get("activities") || "").trim();
    if (activities.length < 10) {
      document.getElementById("log-msg").textContent = "Përshkruani aktivitetet me të paktën një fjali.";
      return;
    }
    if (!data.get("placementId")) {
      document.getElementById("log-msg").textContent = "Nuk keni vendosje aktive.";
      return;
    }
    const skills = data.getAll("skills").map(String);
    saveLogEntry({
      studentId: String(data.get("studentId")),
      placementId: String(data.get("placementId")),
      date: String(data.get("date")),
      startTime,
      endTime,
      hours: hoursBetween(startTime, endTime),
      activities,
      skills,
      photo: data.get("photo") === "on",
      problems: String(data.get("problems") || ""),
      status: intent === "derguar" ? "derguar" : "draft",
    });
    document.getElementById("log-msg").textContent = intent === "derguar" ? "Shënimi u dërgua te mentori." : "Drafti u ruajt.";
    setTimeout(() => { location.hash = "#/ditari"; }, 400);
  });
}
