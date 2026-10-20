/** 8 vocational profiles — TO CONFIRM with the school before pilot. */
export const DREJTIMET = [
  {
    id: "tik",
    name: "TIK",
    code: "TIK",
    color: "#1b4f8a",
    note: "TO CONFIRM",
    skills: ["Instalim softueri", "Rrjetë kompjuterike", "Mirëmbajtje hardueri", "Siguri bazë", "Mbështetje për përdorues"],
  },
  {
    id: "elektro",
    name: "Elektroteknikë",
    code: "ELK",
    color: "#0f766e",
    note: "TO CONFIRM",
    skills: ["Instalime elektrike", "Lexim skemash", "Matje me aparate", "Siguria në punë", "Diagnostikim i thjeshtë"],
  },
  {
    id: "mekanike",
    name: "Mekanikë",
    code: "MEK",
    color: "#b45309",
    note: "TO CONFIRM",
    skills: ["Mirëmbajtje makinerie", "Matje dhe montim", "Vajosje", "Lexim vizatimesh", "Përdorim veglash"],
  },
  {
    id: "ndertimtari",
    name: "Ndërtimtari",
    code: "NDR",
    color: "#7c3aed",
    note: "TO CONFIRM",
    skills: ["Punë murature", "Matje në terren", "Lexim planesh", "Siguria në kantier", "Punë me materiale"],
  },
  {
    id: "ekonomi",
    name: "Ekonomi",
    code: "EKO",
    color: "#0369a1",
    note: "TO CONFIRM",
    skills: ["Arkëtim", "Dokumente financiare", "Excel bazë", "Shërbim klienti", "Organizim dosjesh"],
  },
  {
    id: "turizem",
    name: "Turizëm & Hoteleri",
    code: "TUR",
    color: "#be185d",
    note: "TO CONFIRM",
    skills: ["Pranim mysafirësh", "Rezervime", "Shërbim në dhomë", "Komunikim", "Higjienë"],
  },
  {
    id: "agrobiznes",
    name: "Agrobiznes",
    code: "AGR",
    color: "#15803d",
    note: "TO CONFIRM",
    skills: ["Kujdes për bimë/kafshë", "Regjistrim prodhimi", "Përdorim pajisjesh", "Siguria në fermë", "Shitje lokale"],
  },
  {
    id: "gastronomi",
    name: "Gastronomi",
    code: "GAS",
    color: "#c2410c",
    note: "TO CONFIRM",
    skills: ["Përgatitje ushqimi", "Higjienë dhe HACCP", "Organizim kuzhine", "Shërbim tavoline", "Menaxhim inventari"],
  },
];

export function drejtimById(id) {
  return DREJTIMET.find((item) => item.id === id) ?? null;
}
