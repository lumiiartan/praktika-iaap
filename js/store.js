import { createSeed } from "../data/seed.js";
import { daysBetween, hoursBetween, todayIso, uid } from "./utils.js";

const KEY = "praktika-iaap-v1";
const ROLE_KEY = "praktika-iaap-role";
const THEME_KEY = "praktika-iaap-theme";

let state = null;
const listeners = new Set();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadState() {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      state = JSON.parse(raw);
      return state;
    }
  } catch {
    // Fall through to seed.
  }
  state = createSeed();
  persist();
  return state;
}

export function getState() {
  if (!state) return loadState();
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn(getState()));
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full — keep in-memory.
  }
  emit();
}

export function resetDemo() {
  state = createSeed();
  persist();
  return state;
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || "coordinator";
}

export function setRole(role) {
  localStorage.setItem(ROLE_KEY, role);
  emit();
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme = getTheme()) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  if (getTheme() === next) {
    applyTheme(next);
    return;
  }
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  emit();
}

export function activePeriod(db = getState()) {
  return db.periods.find((p) => p.status === "active") ?? db.periods[0];
}

export function studentById(id, db = getState()) {
  return db.students.find((s) => s.id === id) ?? null;
}

export function businessById(id, db = getState()) {
  return db.businesses.find((b) => b.id === id) ?? null;
}

export function placementForStudent(studentId, periodId, db = getState()) {
  return db.placements.find((p) => p.studentId === studentId && p.periodId === periodId) ?? null;
}

export function approvedHours(studentId, periodId, db = getState()) {
  const placement = placementForStudent(studentId, periodId, db);
  if (!placement) return 0;
  return db.logEntries
    .filter((e) => e.placementId === placement.id && e.status === "aprovuar")
    .reduce((sum, e) => sum + (e.hours || 0), 0);
}

export function businessOccupancy(businessId, periodId, db = getState()) {
  return db.placements.filter((p) => p.businessId === businessId && p.periodId === periodId && p.status !== "anulluar").length;
}

export function computeAlerts(db = getState()) {
  const period = activePeriod(db);
  const demoDate = db.meta.demoDate || todayIso();
  const alerts = [];

  db.students.filter((s) => s.status === "pa_vend" && s.grade >= 11).forEach((s) => {
    alerts.push({
      id: `unplaced-${s.id}`,
      tone: "danger",
      title: "Nxënës pa vend",
      text: `${s.firstName} ${s.lastName} (${s.className}) nuk është vendosur ende.`,
      href: `#/vendosja`,
    });
  });

  db.students.filter((s) => s.status === "ne_praktike").forEach((s) => {
    const placement = placementForStudent(s.id, period.id, db);
    if (!placement) return;
    const entries = db.logEntries.filter((e) => e.placementId === placement.id).sort((a, b) => b.date.localeCompare(a.date));
    const last = entries[0];
    if (!last || daysBetween(last.date, demoDate) >= 3) {
      alerts.push({
        id: `silent-${s.id}`,
        tone: "warn",
        title: "Ditari i heshtur",
        text: `${s.firstName} ${s.lastName} nuk ka shënim për 3+ ditë.`,
        href: `#/ditari?student=${s.id}`,
      });
    }
    entries.filter((e) => e.status === "derguar" && daysBetween(e.date, demoDate) >= 5).forEach((e) => {
      alerts.push({
        id: `late-${e.id}`,
        tone: "warn",
        title: "Miratim i vonuar",
        text: `Shënimi i ${s.firstName} ${s.lastName} pret miratim 5+ ditë.`,
        href: `#/ditari?student=${s.id}`,
      });
    });
  });

  db.businesses.forEach((b) => {
    const used = businessOccupancy(b.id, period.id, db);
    if (used >= b.capacity) {
      alerts.push({
        id: `cap-${b.id}`,
        tone: "info",
        title: "Kapacitet i plotë",
        text: `${b.name} ka ${used}/${b.capacity} vende të zëna.`,
        href: `#/bizneset/${b.id}`,
      });
    }
    if (b.agreement.status === "ne_skadim" || b.agreement.status === "skaduar") {
      alerts.push({
        id: `agr-${b.id}`,
        tone: b.agreement.status === "skaduar" ? "danger" : "warn",
        title: "Marrëveshja e bashkëpunimit",
        text: `${b.name}: statusi «${b.agreement.status === "skaduar" ? "e skaduar" : "afër skadimit"}».`,
        href: `#/bizneset/${b.id}`,
      });
    }
  });

  const completed = db.periods.find((p) => p.status === "completed");
  if (completed) {
    db.placements.filter((p) => p.periodId === completed.id).forEach((p) => {
      const hasFinal = db.evaluations.some((e) => e.placementId === p.id && e.by === "company");
      if (!hasFinal) {
        const student = studentById(p.studentId, db);
        alerts.push({
          id: `eval-${p.id}`,
          tone: "danger",
          title: "Vlerësim përfundimtar i vonuar",
          text: `${student?.firstName ?? ""} ${student?.lastName ?? ""} nuk ka vlerësim nga biznesi.`,
          href: `#/vleresimi?student=${p.studentId}`,
        });
      }
    });
  }

  return alerts;
}

export function suggestBusinesses(studentId, db = getState()) {
  const student = studentById(studentId, db);
  const period = activePeriod(db);
  if (!student) return [];
  return db.businesses
    .map((b) => {
      const used = businessOccupancy(b.id, period.id, db);
      const free = b.capacity - used;
      const drejtimMatch = b.drejtimIds.includes(student.drejtimId);
      const sameVillage = b.village === student.village;
      const nearby = sameVillage || b.village.includes("Suharekë") || student.village.includes("Suharekë");
      const preferred = student.preferenceBusinessIds?.includes(b.id);
      let score = 0;
      const reasons = [];
      if (drejtimMatch) { score += 50; reasons.push("Përputhet me drejtimin"); }
      if (sameVillage) { score += 20; reasons.push("I njëjti fshat/qytet"); }
      else if (nearby) { score += 10; reasons.push("Afër Suharekës"); }
      if (free > 0) { score += Math.min(15, free * 5); reasons.push(`${free} vende të lira`); }
      if (preferred) { score += 15; reasons.push("Preferenca e nxënësit"); }
      if (!drejtimMatch) score -= 40;
      if (free <= 0) score -= 50;
      return { business: b, score, free, drejtimMatch, reasons };
    })
    .filter((item) => item.free > 0)
    .sort((a, b) => b.score - a.score);
}

export function placeStudent(studentId, businessId) {
  const db = getState();
  const student = studentById(studentId, db);
  const business = businessById(businessId, db);
  const period = activePeriod(db);
  if (!student || !business) return { ok: false, message: "Të dhënat nuk u gjetën." };
  if (!business.drejtimIds.includes(student.drejtimId)) {
    return { ok: false, message: "Drejtimi i nxënësit nuk përputhet me biznesin." };
  }
  const used = businessOccupancy(businessId, period.id, db);
  if (used >= business.capacity) {
    return { ok: false, message: "Biznesi ka kapacitet të plotë për këtë periudhë." };
  }
  if (placementForStudent(studentId, period.id, db)) {
    return { ok: false, message: "Nxënësi është tashmë i vendosur në këtë periudhë." };
  }
  db.placements.push({
    id: uid("pl"),
    studentId,
    businessId,
    periodId: period.id,
    companyMentorId: business.mentors[0]?.id ?? null,
    status: "ne_praktike",
    letterGenerated: false,
  });
  student.status = "ne_praktike";
  persist();
  return { ok: true };
}

export function saveLogEntry(entry) {
  const db = getState();
  const hours = entry.hours ?? hoursBetween(entry.startTime, entry.endTime);
  if (entry.id) {
    const existing = db.logEntries.find((e) => e.id === entry.id);
    if (!existing) return { ok: false, message: "Shënimi nuk u gjet." };
    Object.assign(existing, entry, { hours });
  } else {
    db.logEntries.push({
      ...entry,
      id: uid("log"),
      hours,
      status: entry.status || "draft",
      mentorComment: entry.mentorComment || "",
      photo: !!entry.photo,
      problems: entry.problems || "",
    });
  }
  persist();
  return { ok: true };
}

export function setLogStatus(ids, status, comment = "") {
  const db = getState();
  const set = new Set(ids);
  db.logEntries.forEach((entry) => {
    if (set.has(entry.id)) {
      entry.status = status;
      if (comment) entry.mentorComment = comment;
    }
  });
  persist();
}

export function saveBusiness(business) {
  const db = getState();
  if (business.id) {
    const index = db.businesses.findIndex((b) => b.id === business.id);
    if (index >= 0) db.businesses[index] = business;
  } else {
    business.id = uid("biz");
    db.businesses.push(business);
  }
  persist();
  return business;
}

export function saveEvaluation(evaluation) {
  const db = getState();
  if (evaluation.id) {
    const existing = db.evaluations.find((e) => e.id === evaluation.id);
    if (existing) Object.assign(existing, evaluation);
  } else {
    db.evaluations.push({ ...evaluation, id: uid("ev") });
  }
  persist();
}

export function saveVisit(visit) {
  const db = getState();
  if (visit.id) {
    const existing = db.visits.find((v) => v.id === visit.id);
    if (existing) Object.assign(existing, visit);
  } else {
    db.visits.push({ ...visit, id: uid("vis"), status: visit.status || "kryer" });
  }
  persist();
}

export function markLetterGenerated(placementId) {
  const db = getState();
  const placement = db.placements.find((p) => p.id === placementId);
  if (placement && !placement.letterGenerated) {
    placement.letterGenerated = true;
    persist();
  }
}

export function visibleStudents(role, db = getState()) {
  if (role === "student") {
    return db.students.filter((s) => s.id === db.users.demoStudentId);
  }
  if (role === "company") {
    const mentorId = db.users.demoCompanyMentorId;
    const ids = new Set(db.placements.filter((p) => p.companyMentorId === mentorId).map((p) => p.studentId));
    return db.students.filter((s) => ids.has(s.id));
  }
  if (role === "school_mentor") {
    const mentor = db.schoolMentors[0];
    return db.students.filter((s) => s.schoolMentorId === mentor.id);
  }
  return db.students;
}

export function dashboardStats(db = getState()) {
  const period = activePeriod(db);
  const inPractice = db.students.filter((s) => s.status === "ne_praktike").length;
  const unplaced = db.students.filter((s) => s.status === "pa_vend" && s.grade >= 11).length;
  const activeBusinesses = new Set(
    db.placements.filter((p) => p.periodId === period.id).map((p) => p.businessId),
  ).size;
  const approved = db.logEntries.filter((e) => e.status === "aprovuar").reduce((sum, e) => sum + e.hours, 0);
  const required = inPractice * period.requiredHours;
  const companyEvals = db.evaluations.filter((e) => e.by === "company");
  const avg = companyEvals.length
    ? companyEvals.reduce((sum, e) => {
      const vals = Object.values(e.criteria);
      return sum + vals.reduce((a, b) => a + b, 0) / vals.length;
    }, 0) / companyEvals.length
    : 0;
  return {
    inPractice,
    unplaced,
    activeBusinesses,
    approvedHours: approved,
    completionPct: required ? (approved / required) * 100 : 0,
    avgRating: avg,
    period,
  };
}
