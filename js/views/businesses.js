import {
  activePeriod,
  businessById,
  businessOccupancy,
  getRole,
  getState,
  saveBusiness,
} from "../store.js";
import { formatDate, fullName, navigate, statusLabel, statusTone } from "../utils.js";

export function renderBusinesses(parts, params) {
  const db = getState();
  const role = getRole();
  const readonly = role === "director";
  if (parts[1] === "ri" || parts[1] === "ndrysho") {
    if (readonly) return `<p class="card">Vetëm lexim për drejtorin.</p>`;
    return renderForm(parts[1] === "ndrysho" ? parts[2] : null);
  }
  if (parts[1]) return renderDetail(parts[1]);

  const sector = params.sektori || "";
  const drejtim = params.drejtimi || "";
  const village = params.fshati || "";
  const agreement = params.marrëveshja || params.marreveshja || "";
  const freeOnly = params.lire === "1";
  const period = activePeriod(db);

  let rows = db.businesses.slice();
  if (sector) rows = rows.filter((b) => b.sector === sector);
  if (drejtim) rows = rows.filter((b) => b.drejtimIds.includes(drejtim));
  if (village) rows = rows.filter((b) => b.village === village);
  if (agreement) rows = rows.filter((b) => b.agreement.status === agreement);
  if (freeOnly) rows = rows.filter((b) => businessOccupancy(b.id, period.id, db) < b.capacity);

  const sectors = [...new Set(db.businesses.map((b) => b.sector))];
  const villages = [...new Set(db.businesses.map((b) => b.village))];

  return `
    <div class="page-head">
      <div>
        <h1>Bizneset partnere</h1>
        <p class="muted">${rows.length} biznese · kapaciteti dhe marrëveshjet</p>
      </div>
      ${readonly ? "" : `<a class="btn" href="#/bizneset/ri">Shto biznes</a>`}
    </div>
    <form class="card filters" id="biz-filters">
      <div class="field"><label>Sektori</label><select class="control" name="sektori"><option value="">Të gjitha</option>${sectors.map((s) => `<option value="${s}" ${s === sector ? "selected" : ""}>${s}</option>`).join("")}</select></div>
      <div class="field"><label>Drejtimi</label><select class="control" name="drejtimi"><option value="">Të gjitha</option>${db.drejtimet.map((d) => `<option value="${d.id}" ${d.id === drejtim ? "selected" : ""}>${d.name}</option>`).join("")}</select></div>
      <div class="field"><label>Fshati/qyteti</label><select class="control" name="fshati"><option value="">Të gjitha</option>${villages.map((v) => `<option value="${v}" ${v === village ? "selected" : ""}>${v}</option>`).join("")}</select></div>
      <div class="field"><label>Marrëveshja</label><select class="control" name="marreveshja"><option value="">Të gjitha</option><option value="valide" ${agreement === "valide" ? "selected" : ""}>E vlefshme</option><option value="ne_skadim" ${agreement === "ne_skadim" ? "selected" : ""}>Afër skadimit</option><option value="skaduar" ${agreement === "skaduar" ? "selected" : ""}>E skaduar</option></select></div>
      <div class="field"><label>&nbsp;</label><label class="btn secondary" style="justify-content:flex-start"><input type="checkbox" name="lire" value="1" ${freeOnly ? "checked" : ""}/> Vetëm me vende të lira</label></div>
      <div class="field"><label>&nbsp;</label><button class="btn secondary" type="submit">Filtro</button></div>
    </form>
    <section class="card table-wrap">
      <table class="data">
        <thead><tr><th>Biznesi</th><th>Sektori</th><th>Vendndodhja</th><th>Kapaciteti</th><th>Marrëveshja</th><th></th></tr></thead>
        <tbody>
          ${rows.map((b) => {
            const used = businessOccupancy(b.id, period.id, db);
            return `<tr>
              <td><strong>${b.name}</strong><div class="muted">${b.contactName}</div></td>
              <td>${b.sector}</td>
              <td>${b.village}</td>
              <td>${used}/${b.capacity}</td>
              <td><span class="badge ${statusTone(b.agreement.status)}">${statusLabel(b.agreement.status)}</span></td>
              <td><a href="#/bizneset/${b.id}">Hap</a></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </section>`;
}

function renderDetail(id) {
  const db = getState();
  const b = businessById(id, db);
  if (!b) return `<p class="card">Biznesi nuk u gjet.</p>`;
  const period = activePeriod(db);
  const current = db.placements.filter((p) => p.businessId === id && p.periodId === period.id);
  const history = db.placements.filter((p) => p.businessId === id && p.periodId !== period.id);
  const role = getRole();
  return `
    <div class="page-head">
      <div>
        <p><a href="#/bizneset">← Bizneset</a></p>
        <h1>${b.name}</h1>
        <p class="muted">${b.sector} · ${b.address}, ${b.village}</p>
      </div>
      ${role === "director" ? "" : `<a class="btn secondary" href="#/bizneset/ndrysho/${b.id}">Ndrysho</a>`}
    </div>
    <div class="grid-2">
      <section class="card">
        <h2>Kontakti</h2>
        <p style="margin-top:.5rem">${b.contactName}</p>
        <p class="muted">${b.phone} · ${b.email}</p>
        <p style="margin-top:.8rem"><strong>Drejtimet:</strong> ${b.drejtimIds.map((id) => db.drejtimet.find((d) => d.id === id)?.name).join(", ")}</p>
        <p><strong>Kapaciteti:</strong> ${businessOccupancy(b.id, period.id, db)}/${b.capacity}</p>
        <p><strong>Vlerësimi nga nxënësit:</strong> ${b.studentRatingAvg.toFixed(1)} / 5</p>
      </section>
      <section class="card">
        <h2>Marrëveshja</h2>
        <p style="margin-top:.5rem"><span class="badge ${statusTone(b.agreement.status)}">${statusLabel(b.agreement.status)}</span></p>
        <p class="muted" style="margin-top:.5rem">Nënshkruar: ${formatDate(b.agreement.signed)}</p>
        <p class="muted">Skadon: ${formatDate(b.agreement.expires)}</p>
        ${b.agreement.status !== "valide" ? `<p class="badge warn" style="margin-top:.8rem">Kujdes: rinovoni marrëveshjen.</p>` : ""}
        <p style="margin-top:.8rem">${b.notes || ""}</p>
      </section>
    </div>
    <section class="card" style="margin-top:1rem">
      <h2>Nxënësit aktualë</h2>
      <div class="table-wrap" style="margin-top:.5rem">
        <table class="data"><thead><tr><th>Nxënësi</th><th>Klasa</th><th>Statusi</th></tr></thead>
        <tbody>${current.length ? current.map((p) => {
          const s = db.students.find((x) => x.id === p.studentId);
          return `<tr><td>${s ? fullName(s) : p.studentId}</td><td>${s?.className ?? ""}</td><td>${statusLabel(p.status)}</td></tr>`;
        }).join("") : `<tr><td colspan="3" class="muted">Asnjë vendosje aktive.</td></tr>`}</tbody></table>
      </div>
    </section>
    <section class="card" style="margin-top:1rem">
      <h2>Historiku</h2>
      <p class="muted" style="margin-top:.4rem">${history.length} vendosje në periudhat e kaluara.</p>
    </section>`;
}

function renderForm(id) {
  const db = getState();
  const b = id ? businessById(id, db) : {
    name: "", sector: "Teknologji", address: "", village: "Suharekë (qytet)", contactName: "",
    phone: "", email: "", drejtimIds: ["tik"], capacity: 2, mentors: [], 
    agreement: { signed: "2025-09-01", expires: "2026-09-01", status: "valide" }, notes: "", studentRatingAvg: 0,
  };
  return `
    <div class="page-head"><div><h1>${id ? "Ndrysho biznesin" : "Biznes i ri"}</h1></div></div>
    <form class="card grid-2" id="biz-form">
      <input type="hidden" name="id" value="${b.id || ""}" />
      <div class="field"><label>Emri</label><input class="control" name="name" required value="${b.name}" /></div>
      <div class="field"><label>Sektori</label><input class="control" name="sector" required value="${b.sector}" /></div>
      <div class="field"><label>Adresa</label><input class="control" name="address" value="${b.address}" /></div>
      <div class="field"><label>Fshati/qyteti</label><input class="control" name="village" value="${b.village}" /></div>
      <div class="field"><label>Personi kontaktues</label><input class="control" name="contactName" value="${b.contactName}" /></div>
      <div class="field"><label>Telefoni</label><input class="control" name="phone" value="${b.phone}" /></div>
      <div class="field"><label>Email</label><input class="control" name="email" type="email" value="${b.email}" /></div>
      <div class="field"><label>Kapaciteti</label><input class="control" name="capacity" type="number" min="1" value="${b.capacity}" /></div>
      <div class="field"><label>Drejtimi kryesor</label>
        <select class="control" name="drejtimId">${db.drejtimet.map((d) => `<option value="${d.id}" ${b.drejtimIds[0] === d.id ? "selected" : ""}>${d.name}</option>`).join("")}</select>
      </div>
      <div class="field"><label>Shënime</label><textarea class="control" name="notes">${b.notes || ""}</textarea></div>
      <div style="grid-column:1/-1;display:flex;gap:.6rem">
        <button class="btn" type="submit">Ruaj</button>
        <a class="btn secondary" href="#/bizneset">Anulo</a>
      </div>
    </form>`;
}

export function bindBusinesses() {
  document.getElementById("biz-filters")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const q = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (value) q.set(key, String(value));
    }
    navigate(`bizneset?${q.toString()}`);
  });
  document.getElementById("biz-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const id = String(data.get("id") || "");
    const existing = id ? businessById(id) : null;
    const business = {
      ...(existing || { mentors: [], agreement: { signed: "2025-09-01", expires: "2026-09-01", status: "valide" }, studentRatingAvg: 0 }),
      id: id || undefined,
      name: String(data.get("name")),
      sector: String(data.get("sector")),
      address: String(data.get("address")),
      village: String(data.get("village")),
      contactName: String(data.get("contactName")),
      phone: String(data.get("phone")),
      email: String(data.get("email")),
      capacity: Number(data.get("capacity")),
      drejtimIds: [String(data.get("drejtimId"))],
      notes: String(data.get("notes")),
    };
    const saved = saveBusiness(business);
    navigate(`bizneset/${saved.id}`);
  });
}
