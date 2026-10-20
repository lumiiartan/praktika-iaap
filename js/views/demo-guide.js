import { getRole, getState, setRole } from "../store.js";
import { navigate } from "../utils.js";

const STEPS = [
  {
    title: "1. Drejtori sheh panelin",
    body: "Kaloni te roli Drejtori. Hapni panelin: KPI, grafikët dhe sinjalizimet (nxënës pa vend, ditare të heshtura).",
    action: () => { setRole("director"); navigate("paneli"); },
    label: "Hap panelin e drejtorit",
  },
  {
    title: "2. Koordinatori vendos nxënësen",
    body: "Kaloni te Koordinatori → Vendosja. Zgjidhni Era Hoxha (pa vend) dhe shtypni «Cakto» te sugjerimi i parë. Del letra e vendosjes.",
    action: () => { setRole("coordinator"); navigate("vendosja"); },
    label: "Hap vendosjen",
  },
  {
    title: "3. Nxënësja plotëson ditarin",
    body: "Kaloni te Nxënësi. Plotësoni shënimin e sotëm nga pamja celulare dhe dërgojeni te mentori.",
    action: () => { setRole("student"); navigate("ditari"); },
    label: "Hap ditarin e nxënësit",
  },
  {
    title: "4. Mentori në biznes aprovon",
    body: "Kaloni te Mentori në biznes. Shtypni «Aprovo javën» — të gjitha shënimet në pritje aprovohen me një klik.",
    action: () => { setRole("company"); navigate("ditari"); },
    label: "Hap ditarin javor",
  },
  {
    title: "5. Orët dhe raportet",
    body: "Kthehuni te Koordinatori: paneli përditësohet. Hapni Raportet → Vërtetim dhe Raport për donatorë.",
    action: () => { setRole("coordinator"); navigate("raportet"); },
    label: "Hap raportet",
  },
];

export function renderGuideInto(container) {
  if (!container) return;
  const db = getState();
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:start">
      <div>
        <h2>Udhëzues i demos</h2>
        <p class="muted" style="margin-top:.25rem">~10 minuta · ${db.meta.school}</p>
      </div>
    </div>
    <ol>
      ${STEPS.map((step, index) => `
        <li>
          <strong>${step.title}</strong>
          <div class="muted" style="margin:.25rem 0 .45rem">${step.body}</div>
          <button type="button" class="btn sm secondary guide-step" data-step="${index}">${step.label}</button>
        </li>`).join("")}
    </ol>
    <p class="muted" style="margin-top:.85rem;font-size:.85rem">Roli aktual: <strong>${getRole()}</strong></p>
  `;
  container.querySelectorAll(".guide-step").forEach((btn) => {
    btn.addEventListener("click", () => STEPS[Number(btn.dataset.step)].action());
  });
}
