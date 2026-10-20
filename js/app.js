import {
  applyTheme,
  getRole,
  loadState,
  subscribe,
} from "./store.js";
import { parseHash, navigate } from "./utils.js";
import { bindShell, canAccess, renderShell, roleHome } from "./views/shell.js";
import { bindDashboard, renderDashboard } from "./views/dashboard.js";
import { bindBusinesses, renderBusinesses } from "./views/businesses.js";
import { bindStudents, renderStudents } from "./views/students.js";
import { bindPlacement, renderPlacement } from "./views/placement.js";
import { bindLogbook, renderLogbook } from "./views/logbook.js";
import { bindEvaluation, renderEvaluation } from "./views/evaluation.js";
import { bindReports, renderReports } from "./views/reports.js";
import { bindPrivacy, renderPrivacy } from "./views/privacy.js";
import { renderGuideInto } from "./views/demo-guide.js";

const root = document.getElementById("app");
let guideOpen = false;

function toast(text) {
  const existing = document.querySelector(".toast");
  existing?.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = text;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2800);
}

function render() {
  loadState();
  applyTheme();
  const { parts, params } = parseHash();
  const role = getRole();
  let path = parts.join("/") || roleHome(role);
  if (!parts.length) {
    navigate(roleHome(role));
    return;
  }
  let rootPath = parts[0];
  if (!canAccess(role, rootPath) && rootPath !== "mbrojtja") {
    rootPath = roleHome(role);
    path = rootPath;
    parts = [rootPath];
    if (location.hash.replace(/^#\/?/, "").split("?")[0] !== rootPath) {
      navigate(rootPath);
    }
  }

  let mainHtml = "";
  switch (rootPath) {
    case "paneli":
      mainHtml = renderDashboard();
      break;
    case "bizneset":
      mainHtml = renderBusinesses(parts, params);
      break;
    case "nxenesit":
      mainHtml = renderStudents(parts, params);
      break;
    case "vendosja":
      mainHtml = renderPlacement(parts, params);
      break;
    case "ditari":
      mainHtml = renderLogbook(params);
      break;
    case "vleresimi":
      mainHtml = renderEvaluation(params);
      break;
    case "raportet":
      mainHtml = renderReports(params);
      break;
    case "mbrojtja":
      mainHtml = renderPrivacy();
      break;
    default:
      mainHtml = `<section class="card"><h1>Faqja nuk u gjet</h1><p class="muted">Kthehuni te paneli.</p><p><a class="btn" href="#/paneli">Paneli</a></p></section>`;
  }

  root.innerHTML = renderShell({
    activePath: path,
    guideOpen,
    onToggleGuide: () => {},
    mainHtml,
  });

  bindShell(root, {
    onToggleGuide: () => {
      guideOpen = !guideOpen;
      render();
    },
  });

  if (guideOpen) renderGuideInto(document.getElementById("guide-panel"));

  switch (rootPath) {
    case "paneli": bindDashboard(); break;
    case "bizneset": bindBusinesses(); break;
    case "nxenesit": bindStudents(); break;
    case "vendosja": bindPlacement(); break;
    case "ditari": bindLogbook(); break;
    case "vleresimi": bindEvaluation(); break;
    case "raportet": bindReports(); break;
    case "mbrojtja": bindPrivacy(); break;
    default: break;
  }
}

window.addEventListener("hashchange", render);
subscribe(() => render());

if (!location.hash) location.hash = `#/${roleHome(getRole())}`;
else render();

window.addEventListener("praktika:toast", (event) => toast(event.detail));
