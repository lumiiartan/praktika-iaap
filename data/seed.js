import { DREJTIMET } from "./drejtimet.js";

const FEMALE = [
  "Arta", "Blerta", "Drita", "Elona", "Fitore", "Genta", "Hana", "Jehona", "Kaltrina", "Liridona",
  "Mira", "Njomza", "Qendresa", "Rina", "Sara", "Teuta", "Valbona", "Zana", "Diellza", "Era",
  "Flutura", "Gresa", "Leonora", "Majlinda", "Shqipe", "Tringa", "Vjosa", "Donika", "Edona", "Nora",
];
const MALE = [
  "Arben", "Besnik", "Driton", "Endrit", "Faton", "Gent", "Ilir", "Jetmir", "Kastriot", "Luan",
  "Mentor", "Naim", "Petrit", "Rinor", "Shpend", "Trim", "Valon", "Ylli", "Alban", "Blerim",
  "Drilon", "Egzon", "Fisnik", "Labinot", "Milot", "Rron", "Taulant", "Agon", "Dardan", "Enis",
];
const LAST = [
  "Krasniqi", "Berisha", "Gashi", "Morina", "Hoxha", "Bytyqi", "Shala", "Kastrati", "Kelmendi",
  "Mustafa", "Bajrami", "Halimi", "Isufi", "Maloku", "Demiri", "Hoti", "Sejdiu", "Elshani", "Rama", "Zeneli",
];
const VILLAGES = [
  "Suharekë (qytet)", "Samadraxhë", "Mushtisht", "Studençan", "Reqan", "Budakovë", "Bllacë",
  "Sopijë", "Topliqan", "Leshan", "Javor", "Delloc", "Dubravë", "Gelancë",
];
const SECTORS = {
  tik: "Teknologji",
  elektro: "Elektro",
  mekanike: "Mekanikë",
  ndertimtari: "Ndërtim",
  ekonomi: "Ekonomi / shërbime",
  turizem: "Turizëm",
  agrobiznes: "Agrobiznes",
  gastronomi: "Gastronomi",
};

const BUSINESS_NAMES = [
  ["Atelier Digjital Suharekë", "tik", "Suharekë (qytet)"],
  ["Rrjeti Soft Prizren", "tik", "Prizren"],
  ["Elektro Montazh Drita", "elektro", "Suharekë (qytet)"],
  ["Instalime El. Lumi", "elektro", "Mushtisht"],
  ["Punëtori Mekanike Orion", "mekanike", "Suharekë (qytet)"],
  ["Auto Servis Kodra", "mekanike", "Studençan"],
  ["Ndërtim Partner Grup", "ndertimtari", "Suharekë (qytet)"],
  ["Kantieri Fusha e Re", "ndertimtari", "Bllacë"],
  ["Zyrë Kontabiliteti Arka", "ekonomi", "Suharekë (qytet)"],
  ["Market Familjar Ylli", "ekonomi", "Samadraxhë"],
  ["Hotel Vala e Bardhë", "turizem", "Prizren"],
  ["Pansion Ura e Vjetër", "turizem", "Suharekë (qytet)"],
  ["Fermë Frutore Drenica", "agrobiznes", "Delloc"],
  ["Serra e Gjelbër", "agrobiznes", "Gelancë"],
  ["Restorant Sofra e Madhe", "gastronomi", "Suharekë (qytet)"],
  ["Furra e Bardhë", "gastronomi", "Reqan"],
  ["Studio Web Gjeni", "tik", "Suharekë (qytet)"],
  ["Servis Telefonash Qendra", "tik", "Suharekë (qytet)"],
  ["Elektro Servis Volt", "elektro", "Topliqan"],
  ["Punëtori Metalike Ardhja", "mekanike", "Prizren"],
  ["Firma Ndërtimore Tema", "ndertimtari", "Leshan"],
  ["Agjencia Turistike Udhëtar", "turizem", "Prizren"],
  ["Dyqan Kujdesi Bujqësor", "agrobiznes", "Budakovë"],
  ["Kuzhina e Qytetit", "gastronomi", "Suharekë (qytet)"],
  ["Zyrë Administrimi Lokal", "ekonomi", "Suharekë (qytet)"],
];

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function pad(n, size = 3) {
  return String(n).padStart(size, "0");
}

function isoDaysFrom(base, offset) {
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function createSeed() {
  const rng = mulberry32(20261020);
  const periods = [
    {
      id: "per-1",
      name: "Periudha 1: 03.02–28.03.2025",
      start: "2025-02-03",
      end: "2025-03-28",
      status: "completed",
      requiredHours: 120,
    },
    {
      id: "per-2",
      name: "Periudha 2: 06.10–28.11.2025",
      start: "2025-10-06",
      end: "2025-11-28",
      status: "active",
      requiredHours: 120,
    },
    {
      id: "per-3",
      name: "Periudha 3: 02.02–27.03.2026",
      start: "2026-02-02",
      end: "2026-03-27",
      status: "planned",
      requiredHours: 120,
    },
  ];

  const schoolMentors = [
    { id: "sm-1", firstName: "Valbona", lastName: "Kastrati", drejtimIds: ["tik", "elektro"] },
    { id: "sm-2", firstName: "Besnik", lastName: "Morina", drejtimIds: ["mekanike", "ndertimtari"] },
    { id: "sm-3", firstName: "Donika", lastName: "Gashi", drejtimIds: ["ekonomi", "turizem"] },
    { id: "sm-4", firstName: "Arben", lastName: "Hoxha", drejtimIds: ["agrobiznes", "gastronomi"] },
  ];

  const users = {
    coordinator: { id: "u-coord", name: "Fitore Berisha", role: "coordinator" },
    director: { id: "u-dir", name: "Prof. Luan Shala", role: "director" },
    schoolMentors,
    companyMentors: [],
    demoStudentId: null,
    demoCompanyMentorId: null,
  };

  const businesses = BUSINESS_NAMES.map((item, index) => {
    const [name, drejtimId, village] = item;
    const mentor = {
      id: `cm-${pad(index + 1)}`,
      firstName: pick(rng, index % 2 ? FEMALE : MALE),
      lastName: pick(rng, LAST),
      phone: `044 ${100000 + index}`,
      email: `mentor${index + 1}@shembull.biz`,
    };
    users.companyMentors.push(mentor);
    const signed = isoDaysFrom("2024-09-01", Math.floor(rng() * 120));
    const expires = isoDaysFrom(signed, 365 + Math.floor(rng() * 180));
    const daysLeft = Math.floor((new Date(`${expires}T12:00:00`) - new Date("2025-10-20T12:00:00")) / 86400000);
    let agreementStatus = "valide";
    if (daysLeft < 0) agreementStatus = "skaduar";
    else if (daysLeft < 45) agreementStatus = "ne_skadim";
    return {
      id: `biz-${pad(index + 1)}`,
      name,
      sector: SECTORS[drejtimId],
      address: `Rr. e Punës nr. ${index + 3}`,
      village,
      contactName: `${mentor.firstName} ${mentor.lastName}`,
      phone: mentor.phone,
      email: `info${index + 1}@shembull.biz`,
      drejtimIds: [drejtimId],
      capacity: 2 + Math.floor(rng() * 3),
      mentors: [mentor],
      agreement: { signed, expires, status: agreementStatus },
      notes: "Biznes fiktiv për demonstrim.",
      studentRatingAvg: 3.6 + rng() * 1.2,
    };
  });

  users.demoCompanyMentorId = businesses[0].mentors[0].id;

  const students = [];
  let studentIndex = 0;
  for (const drejtim of DREJTIMET) {
    for (let grade = 10; grade <= 12; grade += 1) {
      const count = grade === 11 ? 6 : 5;
      for (let i = 0; i < count; i += 1) {
        studentIndex += 1;
        const female = rng() < 0.42;
        const firstName = pick(rng, female ? FEMALE : MALE);
        const lastName = pick(rng, LAST);
        const schoolMentor = schoolMentors.find((m) => m.drejtimIds.includes(drejtim.id)) ?? schoolMentors[0];
        students.push({
          id: `st-${pad(studentIndex)}`,
          firstName,
          lastName,
          gender: female ? "F" : "M",
          grade,
          className: `${grade}/${(i % 3) + 1}`,
          drejtimId: drejtim.id,
          village: pick(rng, VILLAGES),
          status: "pa_vend",
          schoolMentorId: schoolMentor.id,
          preferenceBusinessIds: [],
        });
      }
    }
  }

  // Ensure ~120: currently 8* (5+6+5)=128. Trim to 120.
  students.splice(120);

  const placements = [];
  const logEntries = [];
  const evaluations = [];
  const visits = [];

  const active = periods[1];
  const completed = periods[0];
  const byDrejtim = Object.fromEntries(DREJTIMET.map((d) => [d.id, businesses.filter((b) => b.drejtimIds.includes(d.id))]));

  // Completed period: place first 48 students historically
  students.slice(0, 48).forEach((student, index) => {
    const pool = byDrejtim[student.drejtimId];
    const business = pool[index % pool.length];
    const mentor = business.mentors[0];
    const placementId = `pl-c-${pad(index + 1)}`;
    placements.push({
      id: placementId,
      studentId: student.id,
      businessId: business.id,
      periodId: completed.id,
      companyMentorId: mentor.id,
      status: "perfunduar",
      letterGenerated: true,
    });
    student.status = "perfunduar";
    evaluations.push({
      id: `ev-c-${pad(index + 1)}`,
      studentId: student.id,
      placementId,
      by: "company",
      criteria: {
        perpikeria: 3 + Math.floor(rng() * 3),
        siguria: 3 + Math.floor(rng() * 3),
        teknike: 3 + Math.floor(rng() * 3),
        ekip: 3 + Math.floor(rng() * 3),
        komunikimi: 3 + Math.floor(rng() * 3),
        iniciativa: 3 + Math.floor(rng() * 3),
        rregullat: 3 + Math.floor(rng() * 3),
      },
      comment: "Nxënësi ka treguar përparim të qëndrueshëm.",
      date: completed.end,
    });
    if (rng() < 0.7) {
      evaluations.push({
        id: `ev-s-${pad(index + 1)}`,
        studentId: student.id,
        placementId,
        by: "student",
        criteria: { biznesi: 3 + Math.floor(rng() * 3) },
        comment: "Ambienti ishte i përshtatshëm për mësim.",
        date: completed.end,
      });
    }
  });

  // Active period: place most remaining / reshuffle active cohort (grades 11-12 preferred)
  const activeCohort = students.filter((s) => s.grade >= 11);
  const capacityLeft = Object.fromEntries(businesses.map((b) => [b.id, b.capacity]));

  let placedActive = 0;
  activeCohort.forEach((student, index) => {
    if (placedActive >= 85) return;
    const pool = byDrejtim[student.drejtimId].filter((b) => capacityLeft[b.id] > 0);
    if (!pool.length) {
      student.status = "pa_vend";
      return;
    }
    // Leave ~12 unplaced for demo story
    if (index >= activeCohort.length - 12) {
      student.status = "pa_vend";
      student.preferenceBusinessIds = pool.slice(0, 2).map((b) => b.id);
      return;
    }
    const business = pool[index % pool.length];
    capacityLeft[business.id] -= 1;
    const mentor = business.mentors[0];
    const placementId = `pl-a-${pad(placedActive + 1)}`;
    placements.push({
      id: placementId,
      studentId: student.id,
      businessId: business.id,
      periodId: active.id,
      companyMentorId: mentor.id,
      status: "ne_praktike",
      letterGenerated: placedActive % 4 !== 0,
    });
    student.status = "ne_praktike";
    student.preferenceBusinessIds = [business.id];
    placedActive += 1;

    // Logbook: roughly Mon-Fri for last 3 weeks of Oct 2025 demo window
    const drejtim = DREJTIMET.find((d) => d.id === student.drejtimId);
    for (let dayOffset = 0; dayOffset < 15; dayOffset += 1) {
      const date = isoDaysFrom(active.start, dayOffset);
      const weekday = new Date(`${date}T12:00:00`).getDay();
      if (weekday === 0 || weekday === 6) continue;
      let status = "aprovuar";
      if (dayOffset >= 12 && index % 7 === 0) status = "derguar"; // waiting approval 5+ days style
      if (dayOffset >= 13 && index % 11 === 0) status = "draft"; // no recent entry trail
      if (dayOffset === 8 && index % 9 === 0) status = "kthyer";
      // Some students missing last 3+ days
      if (index % 13 === 0 && dayOffset >= 12) continue;

      const startTime = "08:00";
      const endTime = dayOffset % 2 ? "14:00" : "13:00";
      const hours = dayOffset % 2 ? 6 : 5;
      logEntries.push({
        id: `log-${pad(logEntries.length + 1, 4)}`,
        studentId: student.id,
        placementId,
        date,
        startTime,
        endTime,
        hours,
        activities: "Kam ndihmuar në detyrat e përditshme të vendit të punës dhe kam praktikuar procedurat e mësuara.",
        skills: drejtim.skills.slice(0, 2 + Math.floor(rng() * 2)),
        photo: false,
        problems: status === "kthyer" ? "Mungonte përshkrimi i detajuar i aktiviteteve." : "",
        status,
        mentorComment: status === "kthyer" ? "Ju lutem shtoni më shumë detaje për aktivitetet." : status === "aprovuar" ? "Mirë." : "",
      });
    }

    if (index % 8 === 0) {
      visits.push({
        id: `vis-${pad(visits.length + 1)}`,
        schoolMentorId: student.schoolMentorId,
        studentId: student.id,
        businessId: business.id,
        date: isoDaysFrom(active.start, 7 + (index % 5)),
        notes: "Nxënësi është i angazhuar. Mentori në biznes jep udhëzime të qarta.",
        recommendations: "Të forcohet dokumentimi i orëve.",
        status: "kryer",
      });
    }
  });

  // Grade 10 are outside the active placement wave for this demo story.
  students.forEach((s) => {
    if (s.grade === 10 && s.status === "pa_vend") s.status = "i_vendosur";
  });

  // Demo spotlight student: first unplaced TIK student for placement story
  const demoUnplaced = students.find((s) => s.status === "pa_vend" && s.drejtimId === "tik")
    ?? students.find((s) => s.status === "pa_vend");
  if (demoUnplaced) {
    demoUnplaced.firstName = "Era";
    demoUnplaced.lastName = "Hoxha";
    demoUnplaced.village = "Mushtisht";
    demoUnplaced.grade = 11;
    demoUnplaced.className = "11/1";
    demoUnplaced.drejtimId = "tik";
    demoUnplaced.status = "pa_vend";
    const tikBiz = businesses.filter((b) => b.drejtimIds.includes("tik"));
    demoUnplaced.preferenceBusinessIds = tikBiz.slice(0, 2).map((b) => b.id);
  }

  // Demo student with logbook: placed at first TIK business
  const demoStudent = students.find((s) => s.status === "ne_praktike" && s.drejtimId === "tik") ?? students.find((s) => s.status === "ne_praktike");
  if (demoStudent) {
    demoStudent.firstName = "Arta";
    demoStudent.lastName = "Krasniqi";
    demoStudent.village = "Suharekë (qytet)";
    users.demoStudentId = demoStudent.id;
    const placement = placements.find((p) => p.studentId === demoStudent.id && p.periodId === active.id);
    if (placement) {
      users.demoCompanyMentorId = placement.companyMentorId;
      // Ensure today-ish entry pending for approval flow
      const recent = isoDaysFrom(active.start, 14);
      const existing = logEntries.find((e) => e.studentId === demoStudent.id && e.date === recent);
      if (existing) {
        existing.status = "derguar";
        existing.mentorComment = "";
      } else {
        logEntries.push({
          id: `log-demo-1`,
          studentId: demoStudent.id,
          placementId: placement.id,
          date: recent,
          startTime: "08:00",
          endTime: "14:00",
          hours: 6,
          activities: "Kam instaluar softuer dhe kam ndihmuar në mirëmbajtjen e pajisjeve.",
          skills: ["Instalim softueri", "Mirëmbajtje hardueri"],
          photo: false,
          problems: "",
          status: "derguar",
          mentorComment: "",
        });
      }
    }
  }

  // Overfill one business slightly for capacity alert (mark capacity low)
  const busy = businesses.find((b) => b.drejtimIds.includes("gastronomi"));
  if (busy) busy.capacity = Math.max(1, busy.capacity - 1);

  // One overdue final evaluation in active (none expected mid-period) — mark completed period missing for 2
  evaluations.splice(0, 2);

  return {
    meta: {
      school: 'IAAP "Skënder Luarasi"',
      municipality: "Suharekë",
      tagline: "Platforma për menaxhimin e praktikës profesionale",
      generatedAt: "2025-10-20",
      demoDate: "2025-10-20",
    },
    drejtimet: DREJTIMET,
    periods,
    businesses,
    students,
    placements,
    logEntries,
    evaluations,
    visits,
    users,
    schoolMentors,
  };
}
