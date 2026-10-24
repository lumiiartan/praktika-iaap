# Paketa e takimit — IAAP «Skënder Luarasi»
## Platformë digjitale (modulare) · start me **Praktika**

**Për:** Drejtori / stafi vendimmarrës  
**Përgatitur nga:** Artan Lumi  
**Qëllimi i takimit:** dakordësi për scope-in esencial, afatet, pagesat dhe fillimin e punës  
**Dokumentet shoqëruese:** `paramasa-praktika-iaap.xlsx`

> Parimi: **platformë e hapur për module të ardhshme**, por **tani punojmë vetëm esenciale** (Moduli Praktika). Buxheti i plotë / module të tjera — sipas buxhetit **2027** dhe dakordësisë së përbashkët.

---

## 1. Agenda e takimit (45–60 min)

| Min | Temë | Rezultati i dëshiruar |
|-----|------|------------------------|
| 0–5 | Hapja + demo e shkurtër (Praktika) | Të shohin produktin |
| 5–15 | Vizioni: platformë modulare (jo vetëm një app) | Të kuptojnë rrugën 2025→2027 |
| 15–30 | Çfarë hyn **tani** (esenciale) vs çfarë **mbetet për 2027** | Scope i ngrirë |
| 30–40 | Paramasa + totali + pagesat sipas fazave | Dakordësi financiare |
| 40–50 | Afate kohore + kush jep çfarë (DNS, lista nxënësish…) | Plan pune |
| 50–60 | Vendimi: fillojmë / rregullojmë / takimi tjetër | Nënshkrim ose email konfirmues |

---

## 2. Ideja që duhet të dalë e qartë

### Sot
Shkolla ka shumë procese që mund të digjitalizohen (praktikë, inventar, orar, dokumente, komunikim…).  
**Nuk i bëjmë të gjitha menjëherë.**

### Koncepti
Një **platformë digjitale e shkollës**, e ndarë në **module**:

```text
┌─────────────────────────────────────────────┐
│     PLATFORMË IAAP (e përbashkët)           │
│  përdorues · role · siguri · baza · hosting │
└─────────────────────────────────────────────┘
        │
        ├── [TANI]  Moduli PRAKTIKA  ← fillojmë këtu
        ├── [2027+] Inventari / laboratorët
        ├── [2027+] Orari / planifikimi
        ├── [2027+] Dokumente / arkiva
        ├── [2027+] Komunikimi prind–shkollë
        └── [më vonë] Multi-shkollë / module të tjera
```

### Pse kështu
- Pagesë e menaxhueshme tani  
- Gati për buxhetin **2027** pa rifilluar nga zero  
- I njëjti model mund të shkojë edhe te **shkolla të tjera** (me pak adaptim)

---

## 3. Çfarë bëjmë TANI (esenciale) — Moduli Praktika

| # | Përmbajtja |
|---|------------|
| 1 | Analiza e shkurtër + kërkesat (me koordinatorin) |
| 2 | Arkitektura modulare (që të shtohen module më vonë) |
| 3 | Platforma bazë: databaza, hosting, HTTPS |
| 4 | Kyçje + **5 role**: drejtor, koordinator, mentor shkolle, mentor biznesi, nxënës |
| 5 | Nxënës, drejtime, biznese partnerë |
| 6 | Vendosja e praktikës |
| 7 | Ditari + aprovimi |
| 8 | Vlerësimi |
| 9 | Raporte / Excel / PDF |
| 10 | Go-live, manuale, 2 sesione trajnimi |
| 11 | Garanci **6 muaj** (bugfix) |

**Jashtë esenciales tani (me dakordësi / 2027):** app mobil native, inventar, orar, e-Kosova, multi-shkollë, SMS me pagesë.

Demo live (për takim): https://lumiiartan.github.io/praktika-iaap/

---

## 4. Paramasa — totali i propozuar

Shih Excel: **`docs/paramasa-praktika-iaap.xlsx`**

| Paketa | Total me TVSH (propozim) | Shënim |
|--------|--------------------------|--------|
| **A. Esenciale — Praktika (tani)** | **€6.900** | Fillojmë menjëherë pas dakordësisë |
| B. Module të ardhshme (orientuese) | shih Excel fletën «Module 2027» | Nuk faturrohen tani |
| C. Mirëmbajtje pas garancisë | €80–120 / muaj | Opsionale |

> Çmimet janë **nën** shembullin e tenderit të madh të digjitalizimit (~€95k), sepse scope-i tani është i fokusuar te një modul + platforma bazë për shkollë.

---

## 5. Afate kohore (propozim për dakordësi)

| Faza | Kohëzgjatje | Çfarë dorëzohet |
|------|-------------|-----------------|
| **F0** Kickoff + kërkesat | 1 javë | Lista e roleve, drejtimeve, akses DNS |
| **F1** Platforma + auth + DB | 2 javë | Staging me login |
| **F2** Moduli Praktika (i plotë) | 3 javë | App funksional në staging |
| **F3** Test me shkollën (UAT) | 1 javë | Lista e rregullimeve + aprovim |
| **F4** Go-live + trajnim | 3–5 ditë | Production + manuale |
| **Total** | **~7–8 javë** | Nga dita e fillimit |

*Nëse dokumentet (lista nxënësish, DNS) vonohen nga shkolla, afati zhvendoset me të njëjtën kohë.*

```text
Javë:  1    2    3    4    5    6    7    8
F0     ██
F1          ████████
F2                    ████████████
F3                                    ████
F4                                         ██
```

---

## 6. Pagesat (propozim milestone)

Bazuar te totali esencial **€6.900 me TVSH**:

| Milestone | % | Shuma | Kur |
|-----------|---|-------|-----|
| M1 — Kickoff / fillim pune | 20% | €1.380 | Nënshkrim / email dakordësie |
| M2 — Staging: auth + module kryesore | 40% | €2.760 | Demo staging e aprovuar |
| M3 — Go-live | 30% | €2.070 | Sistemi live + trajnim |
| M4 — Mbyllje garancie 6 muaj / stabilizim | 10% | €690 | Pas 30 ditësh live (ose sipas dakordësisë) |

*Nëse pagesa kryesore është e lidhur me buxhetin 2027: mund të dakordësohet **parapagim i vogël tani** + pjesa tjetër sipas kalendarit të shkollës — të shënohet në procesverbal.*

---

## 7. Çfarë duhet nga shkolla (që unë të filloj)

- [ ] Person kontakti (koordinatori i praktikës)  
- [ ] Konfirmim i drejtimeve / profileve  
- [ ] Lista fillestare nxënës + biznese (Excel) ose import më vonë  
- [ ] Subdomain: p.sh. `praktika.iaapsl.com` (DNS)  
- [ ] Email për njoftime (opsionale)  
- [ ] Dakordësi me shkrim (email mjafton) për scope + çmim + afat  

---

## 8. Çfarë të dalim të dakorduar sot (checklist)

- [ ] Scope esencial = vetëm Moduli Praktika (+ platforma bazë)  
- [ ] Module të tjera = katalog 2027, jo detyrim tani  
- [ ] Total esencial: **€ _____** me TVSH (propozim €6.900)  
- [ ] Afati: **_____ javë** nga data e fillimit  
- [ ] Pagesat: skema M1–M4 ose variante 2027  
- [ ] Data e fillimit të punës: **__________**  
- [ ] Personi kontakt nga shkolla: **__________**  

---

## 9. Si e hap takimin (2 minuta)

> «Ideja nuk është vetëm një demo e praktikës. Është një platformë e shkollës ku Praktika është moduli i parë. Tani bëjmë esenciale që të jeni live shpejt dhe me kosto të ulët; në 2027, me buxhet, shtojmë module të tjera pa rifilluar nga zero. Sot dakordësojmë çfarë hyn tani, sa kushton, kur dorëzohet dhe si paguhet — pastaj unë filloj punën.»

---

## 10. Linke të dobishme

| Çfarë | Link |
|-------|------|
| Demo Praktika | https://lumiiartan.github.io/praktika-iaap/ |
| Të gjitha demot | https://lumiiartan.github.io/demo-hub/ |
| Paramasa (Excel) | `docs/paramasa-praktika-iaap.xlsx` |
| Plan teknik i detajuar | `docs/PLANI-IMPLEMENTIMIT.md` |
