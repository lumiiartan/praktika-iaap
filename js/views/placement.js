import {
  activePeriod,
  businessOccupancy,
  getRole,
  getState,
  markLetterGenerated,
  placeStudent,
  suggestBusinesses,
} from "../store.js";
import { formatDate, fullName, navigate } from "../utils.js";

export function renderPlacement(parts, params) {
  const role = getRole();
  if (role !== "coordinator") {
    return `<section class="card"><h1>Vendosja</h1><p class="muted" style="margin-top:.5rem">Kjo pamje është për koordinatorin e praktikës.</p></section>`;
  }
  if (parts[1] === "leter" && parts[2]) return renderLetter(parts[2]);

  const db = getState();
  const period = activePeriod(db);
  const selected = params.student || "";
  const unplaced = db.students.filter((s) => s.status === "pa_vend" && s.grade >= 11);
  const businesses = db.businesses.map((b) => ({
    ...b,
    free: b.capacity - businessOccupancy(b.id, period.id, db),
  })).filter((b) => b.free > 0);

  const suggestions = selected ? suggestBusinesses(selected, db).slice(0, 5) : [];
  const selectedStudent = unplaced.find((s) => s.id === selected);

  return `
    <div class="page-head">
      <div>
        <h1>Vendosja në praktikë</h1>
        <p class="muted">${period.name} · ${unplaced.length} pa vend · ${businesses.length} biznese me vende të lira</p>
      </div>
    </div>
    <div class="placement-board">
      <section class="card">
        <h2>Nxënës pa vend</h2>
        <div class="board-col" id="unplaced-list" style="margin-top:.75rem">
          ${unplaced.map((s) => {
            const d = db.drejtimet.find((x) => x.id === s.drejtimId);
            return `<div class="board-item ${selected === s.id ? "badge info" : ""}" draggable="true" data-student="${s.id}">
              <strong>${fullName(s)}</strong>
              <div class="muted">${s.className} · ${d?.name ?? ""} · ${s.village}</div>
              <div style="margin-top:.45rem"><a class="btn sm secondary" href="#/vendosja?student=${s.id}">Zgjidh</a></div>
            </div>`;
          }).join("") || `<p class="empty">Të gjithë janë të vendosur.</p>`}
        </div>
      </section>
      <section class="card">
        <h2>Biznese me kapacitet</h2>
        ${selectedStudent ? `
          <p class="muted" style="margin-top:.4rem">Sugjerime për <strong>${fullName(selectedStudent)}</strong></p>
          <div style="margin-top:.75rem;display:grid;gap:.55rem">
            ${suggestions.map((item) => `
              <div class="board-item" data-business="${item.business.id}">
                <strong>${item.business.name}</strong>
                <div class="suggest">${item.reasons.join(" · ")}</div>
                <div style="margin-top:.5rem">
                  <button type="button" class="btn sm assign-btn" data-student="${selectedStudent.id}" data-business="${item.business.id}">Cakto</button>
                </div>
              </div>`).join("") || `<p class="empty">Nuk ka sugjerime të vlefshme.</p>`}
          </div>` : `<p class="muted" style="margin-top:.6rem">Zgjidhni një nxënës majtas për të parë sugjerimet.</p>
          <div class="board-col" style="margin-top:.75rem">
            ${businesses.slice(0, 8).map((b) => `<div class="board-item" data-business="${b.id}"><strong>${b.name}</strong><div class="muted">${b.village} · ${b.free} vende</div></div>`).join("")}
          </div>`}
      </section>
    </div>
    <p id="place-msg" class="muted" style="margin-top:1rem" role="status"></p>`;
}

function renderLetter(studentId) {
  const db = getState();
  const student = db.students.find((s) => s.id === studentId);
  const period = activePeriod(db);
  const placement = db.placements.find((p) => p.studentId === studentId && p.periodId === period.id);
  const business = placement ? db.businesses.find((b) => b.id === placement.businessId) : null;
  if (!student || !placement || !business) {
    return `<section class="card"><p>Nuk u gjet vendosja për këtë nxënës.</p><a href="#/vendosja">Kthehu</a></section>`;
  }
  const drejtim = db.drejtimet.find((d) => d.id === student.drejtimId);
  return `
    <div class="page-head no-print">
      <div><h1>Letër vendosjeje</h1><p class="muted">Gati për printim A4</p></div>
      <div style="display:flex;gap:.5rem">
        <button class="btn" type="button" onclick="window.print()">Printo</button>
        <a class="btn secondary" href="#/vendosja">Kthehu</a>
      </div>
    </div>
    <article class="print-sheet card">
      <div style="display:flex;align-items:center;gap:1rem">
        <img src="./assets/logo-school.jpg" alt="" width="64" height="64" style="border-radius:50%" />
        <div>
          <p class="school">${db.meta.school}</p>
          <p class="muted">Qendra e Karrierës · ${db.meta.municipality}</p>
        </div>
      </div>
      <div class="accent-line" aria-hidden="true"></div>
      <h1>Letër vendosjeje në praktikë profesionale</h1>
      <p style="margin-top:1rem">Nxënësi/ja <strong>${fullName(student)}</strong>, klasa ${student.className}, drejtimi ${drejtim?.name ?? ""}, vendoset për praktikë profesionale te biznesi partner:</p>
      <p style="margin-top:1rem;font-size:1.15rem"><strong>${business.name}</strong><br/>${business.address}, ${business.village}</p>
      <p style="margin-top:1rem">Periudha: ${period.name}<br/>Mentori në biznes: ${business.contactName}<br/>Data: ${formatDate(db.meta.demoDate)}</p>
      <div class="sign-row">
        <div class="sign-line">Koordinatori i praktikës</div>
        <div class="sign-line">Drejtori i shkollës</div>
      </div>
      <p class="muted" style="margin-top:2rem;font-size:.85rem">Dokument demonstrues – të dhëna fiktive.</p>
    </article>`;
}

export function bindPlacement() {
  const { parts } = (() => {
    const raw = location.hash.replace(/^#\/?/, "");
    return { parts: raw.split("?")[0].split("/").filter(Boolean) };
  })();
  if (parts[1] === "leter" && parts[2]) {
    const db = getState();
    const period = activePeriod(db);
    const placement = db.placements.find((p) => p.studentId === parts[2] && p.periodId === period.id);
    if (placement) markLetterGenerated(placement.id);
  }

  const msg = document.getElementById("place-msg");
  document.querySelectorAll(".assign-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const result = placeStudent(btn.dataset.student, btn.dataset.business);
      if (!result.ok) {
        if (msg) msg.textContent = result.message;
        return;
      }
      navigate(`vendosja/leter/${btn.dataset.student}`);
    });
  });

  let dragged = null;
  document.querySelectorAll(".board-item[draggable='true']").forEach((item) => {
    item.addEventListener("dragstart", () => {
      dragged = item.dataset.student;
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
  });
  document.querySelectorAll("[data-business]").forEach((target) => {
    target.addEventListener("dragover", (event) => event.preventDefault());
    target.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!dragged) return;
      const result = placeStudent(dragged, target.dataset.business);
      if (!result.ok) {
        if (msg) msg.textContent = result.message;
        return;
      }
      navigate(`vendosja/leter/${dragged}`);
    });
  });
}
