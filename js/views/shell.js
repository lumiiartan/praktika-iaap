import { getRole, getState, getTheme, resetDemo, setRole, setTheme } from "../store.js";
import { navigate } from "../utils.js";

export const ROLES = [
  { id: "coordinator", label: "Koordinatori i praktikës" },
  { id: "director", label: "Drejtori" },
  { id: "school_mentor", label: "Mësimdhënësi mentor" },
  { id: "company", label: "Mentori në biznes" },
  { id: "student", label: "Nxënësi" },
];

const NAV = {
  coordinator: [
    { path: "paneli", label: "Paneli", icon: "▣" },
    { path: "bizneset", label: "Bizneset", icon: "⌂" },
    { path: "nxenesit", label: "Nxënësit", icon: "👤" },
    { path: "vendosja", label: "Vendosja", icon: "⇄" },
    { path: "ditari", label: "Ditari", icon: "☰" },
    { path: "vleresimi", label: "Vlerësimi", icon: "★" },
    { path: "raportet", label: "Raportet", icon: "▤" },
    { path: "mbrojtja", label: "Mbrojtja", icon: "◎" },
  ],
  director: [
    { path: "paneli", label: "Paneli", icon: "▣" },
    { path: "raportet", label: "Raportet", icon: "▤" },
    { path: "mbrojtja", label: "Mbrojtja", icon: "◎" },
  ],
  school_mentor: [
    { path: "paneli", label: "Paneli", icon: "▣" },
    { path: "nxenesit", label: "Nxënësit e mi", icon: "👤" },
    { path: "ditari", label: "Ditari", icon: "☰" },
    { path: "vleresimi", label: "Vizitat", icon: "★" },
  ],
  company: [
    { path: "paneli", label: "Paneli", icon: "▣" },
    { path: "ditari", label: "Ditari javor", icon: "☰" },
    { path: "nxenesit", label: "Nxënësit", icon: "👤" },
    { path: "vleresimi", label: "Vlerësimi", icon: "★" },
  ],
  student: [
    { path: "paneli", label: "Paneli im", icon: "▣" },
    { path: "ditari", label: "Ditari im", icon: "☰" },
    { path: "vleresimi", label: "Vlerësimet", icon: "★" },
  ],
};

export function roleHome(role) {
  return NAV[role]?.[0]?.path ?? "paneli";
}

export function canAccess(role, path) {
  const root = path.split("/")[0];
  return (NAV[role] || []).some((item) => item.path === root);
}

export function renderShell({ activePath, guideOpen, onToggleGuide, mainHtml }) {
  const db = getState();
  const role = getRole();
  const theme = getTheme();
  const links = NAV[role] || NAV.coordinator;
  const root = activePath.split("/")[0] || "paneli";

  return `
    <div class="brand-strip" aria-hidden="true"></div>
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <img src="./assets/logo-school.jpg" alt='Logo IAAP "Skënder Luarasi"' width="48" height="48" />
          <div class="brand-text">
            <strong>Praktika · Qendra e Karrierës</strong>
            <span>IAAP «Skënder Luarasi» · Suharekë</span>
          </div>
        </div>
        <span class="badge accent">Demo – të dhëna fiktive</span>
        <div class="topbar-actions">
          <label>
            <span class="sr-only">Roli i demo-s</span>
            <select class="role-select" id="role-switcher" aria-label="Roli i demo-s">
              ${ROLES.map((item) => `<option value="${item.id}" ${item.id === role ? "selected" : ""}>${item.label}</option>`).join("")}
            </select>
          </label>
          <button type="button" class="btn secondary sm" id="btn-guide">${guideOpen ? "Mbyll udhëzuesin" : "Udhëzues i demos"}</button>
          <button type="button" class="btn ghost sm" id="btn-theme">${theme === "dark" ? "Dritë" : "Errët"}</button>
          <button type="button" class="btn ghost sm" id="btn-reset">Rivendos demon</button>
        </div>
      </div>
    </header>
    <div class="app-body">
      <aside class="sidebar" aria-label="Navigimi">
        <nav>
          ${links.map((link) => `
            <a class="nav-link ${root === link.path ? "active" : ""}" href="#/${link.path}">
              <span class="icon" aria-hidden="true">${link.icon}</span>${link.label}
            </a>`).join("")}
        </nav>
      </aside>
      <main class="content" id="main">${mainHtml}</main>
    </div>
    <nav class="mobile-nav" aria-label="Navigimi celular">
      ${links.slice(0, 5).map((link) => `
        <a class="nav-link ${root === link.path ? "active" : ""}" href="#/${link.path}">
          <span class="icon" aria-hidden="true">${link.icon}</span>${link.label}
        </a>`).join("")}
    </nav>
    <footer class="app-footer">Demo – të gjitha të dhënat janë fiktive · ${db.meta.school}, ${db.meta.municipality}</footer>
    ${guideOpen ? `<aside class="guide-panel" id="guide-panel" aria-label="Udhëzues i demos"></aside>` : ""}
  `;
}

export function bindShell(root, { onToggleGuide }) {
  root.querySelector("#role-switcher")?.addEventListener("change", (event) => {
    setRole(event.target.value);
    navigate(roleHome(event.target.value));
  });
  root.querySelector("#btn-theme")?.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  });
  root.querySelector("#btn-reset")?.addEventListener("click", () => {
    if (confirm("Të rivendosen të dhënat fillestare të demo-s?")) {
      resetDemo();
      navigate(roleHome(getRole()));
    }
  });
  root.querySelector("#btn-guide")?.addEventListener("click", onToggleGuide);
}
