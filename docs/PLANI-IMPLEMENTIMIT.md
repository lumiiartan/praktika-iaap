# PLANI PROFESIONAL I IMPLEMENTIMIT
## Sistemi “Praktika” — IAAP Skënder Luarasi

**Klienti:** IAAP “Skënder Luarasi” (Suharekë)  
**Produkt:** Platformë digjitale për menaxhimin e praktikës profesionale (nxënës ↔ biznes ↔ shkollë)  
**Status:** Tender i fituar · Demo funksional ekziston · Implementim production në pritje  
**Dokumenti:** Plan teknik + biznesor + roadmap hap-pas-hapi  
**Gjuha e produktit:** Shqip (UI) · Dokumentim teknik: Shqip / Anglisht sipas nevojës  

---

## 0. Përmbledhje ekzekutive

Demo-ja aktuale (HTML/CSS/JS, localStorage, GitHub Pages) vërteton UX dhe rrjedhat e punës. Faza e ardhshme e shndërron këtë në **sistem production**: autentifikim real, bazë të dhënash, API, hosting i qëndrueshëm, domain, backup, dhe dorëzim me trajnim.

**Objektivi i projektit:** një platformë e thjeshtë, e shpejtë dhe e lirë për t’u mirëmbajtur, që shkolla mund ta përdorë çdo vit akademik pa varësi nga Excel / letra.

**Parimi i buxhetit:** stack i hapur (open-source), një server i vogël në BE, pa SaaS të shtrenjtë, zhvillim incremental mbi demos ekzistuese.

---

## 1. Objekti i punës (Scope)

### 1.1 Brenda scope (MVP production)

| # | Moduli | Përshkrim i shkurtër |
|---|--------|----------------------|
| 1 | Autentifikim & role | Admin shkolle, koordinator, biznes, nxënës (opsional: prind/lexim) |
| 2 | Nxënës | Regjistrim, drejtim, klasë, status praktike |
| 3 | Biznese | Partnerët, kapaciteti, kontaktet, fusha |
| 4 | Vendosja | Matching nxënës–biznes, aprovim |
| 5 | Ditari i praktikës | Orë / ditë / aktivitet (nga nxënësi, aprovim nga mentori) |
| 6 | Vlerësimi | Nota / kompetenca nga biznesi + shkolla |
| 7 | Raporte | Statistikime, Excel/PDF për drejtori / komunë |
| 8 | Paneli | KPI: të vendosur, orë, biznese aktive |
| 9 | Privatësia | Njoftime GDPR / LPD, pëlqime, audit i lehtë |
| 10 | Udhëzues | FAQ / guide për role |

### 1.2 Jashtë scope (Faza 2 — opsionale, me kontratë shtesë)

- Integrim e-Kosova / eID  
- Aplikacion mobil native (iOS/Android)  
- Njoftime SMS me pagesë për mesazh  
- Multi-shkollë / SaaS multi-tenant  
- BI i avancuar / Power BI  
- Portal publik i hapur për biznese të reja me workflow kompleks  

### 1.3 Supozime

- Numri i përdoruesve aktivë: ~200–800 nxënës + ~30–80 biznese + staf shkolle.  
- Përdorimi kryesor: desktop + tablet; mobile responsive i mjaftueshëm.  
- Gjuha: shqip.  
- Viti akademik si cikël kryesor i të dhënave.

---

## 2. Arkitektura e synuar

```
[Browser – SPA]
      │ HTTPS
      ▼
[Nginx – reverse proxy + static frontend]
      │
      ├── /        → frontend (Vite build)
      └── /api     → Node.js API (Express/Fastify)
                        │
                        ├── PostgreSQL
                        ├── File storage (uploads lokale / disk)
                        └── Redis (opsional – sesione / cache; Faza 1.5)
```

**Pse kjo arkitekturë (buxhet i ulët):**
- Një VPS = frontend + API + DB → kosto mujore minimale.  
- Stack JavaScript end-to-end → një zhvillues, më pak orë.  
- PostgreSQL i qëndrueshëm, backup i lehtë.  
- Pa vendor lock-in (AWS/Azure të shtrenjta për tender shkolle).

### 2.1 Stack i rekomanduar (Faza 1)

| Shtresa | Teknologji | Arsye |
|---------|------------|-------|
| Frontend | Vite + HTML/JS modules **ose** Vite + React | Demo ekziston në vanilla; React vetëm nëse UI rritet shumë |
| Backend | Node.js 20 + Fastify (ose Express) | I lehtë, i shpejtë, i njohur |
| ORM | Prisma | Migrime të qarta, tipizim |
| DB | PostgreSQL 16 | Standardi i industrisë |
| Auth | JWT + refresh cookie HttpOnly | I thjeshtë, i sigurt mjaftueshëm |
| Email | SMTP (shkolla / Zoho / Brevo free tier) | Njoftime reset password |
| PDF/Excel | pdfkit / exceljs | Raporte |
| Reverse proxy | Nginx | TLS, static, gzip |
| TLS | Let’s Encrypt | Falas |
| OS | Ubuntu 24.04 LTS | Stabil |
| Process manager | systemd ose PM2 | Restart automatik |
| CI/CD | GitHub Actions | Deploy me push në `main` |

**Vendim i rëndësishëm Frontend:**  
**Rekomandim për buxhet:** mbaj SPA-në aktuale (ES modules), lidhe me API, pastro localStorage. Kjo kursen 30–40% të orëve të frontend krahasuar me rishkrim të plotë në React.

---

## 3. Frontend — plan hap pas hapi

### Faza F0 — Stabilizim i demos (1–2 ditë)
1. Audit i ekraneve dhe rrjedhave (paneli, biznese, nxënës, vendosja, ditari, vlerësimi, raportet).  
2. Lista e “gaps” vs kërkesat e tenderit.  
3. Freeze i branding (ngjyra IAAP `#0f3a67` / `#d8ab3f`, Montserrat, logo zyrtare).

### Faza F1 — Shtresa API client (2–3 ditë)
1. Krijo `js/api.js` (fetch wrapper, token, error handling).  
2. Zëvendëso gradualisht `store.js` (localStorage) me thirrje API.  
3. Gjendje loading / empty / error për çdo view.

### Faza F2 — Auth UI (2 ditë)
1. Faqe login / logout / ndryshim fjalëkalimi.  
2. Ruajtje e rolit në sesion; fshehje menush sipas rolit.  
3. Rrugë të mbrojtura (redirect në login).

### Faza F3 — Forma production (3–4 ditë)
1. Validim i fushave (klient + mesazhe server).  
2. Upload i dokumenteve të lehta (marrëveshje, vlerësim PDF) nëse kërkohet.  
3. Paginim / kërkim / filtra për lista të gjata.

### Faza F4 — Raporte & UX (2 ditë)
1. Export Excel / PDF nga UI.  
2. Print-friendly views.  
3. Test mobile (320–768px).

### Faza F5 — Polish (1–2 ditë)
1. Accessibility bazë (kontrast, focus, labels).  
2. Performance: lazy load Chart.js, minify build me Vite.  
3. Udhëzues i përditësuar brenda app.

**Deliverable frontend:** build statik i shërbyer nga Nginx, i lidhur 100% me API.

---

## 4. Backend — plan hap pas hapi

### Faza B0 — Scaffold (1 ditë)
1. Repo `api/` me Fastify + Prisma + struktura folderësh.  
2. Env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`.  
3. Healthcheck `GET /api/health`.

### Faza B1 — Modele & migrime (2 ditë)
1. Schema Prisma (shih seksionin 5).  
2. Seed: drejtimet, admin fillestar, të dhëna demo (opsionale).  
3. Migrime versionuese.

### Faza B2 — Auth (2 ditë)
1. `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`.  
2. Hash fjalëkalimi (bcrypt/argon2).  
3. Middleware `requireAuth` + `requireRole(...)`.  
4. Reset password me token email (nëse SMTP gati).

### Faza B3 — CRUD kryesor (5–7 ditë)
1. Nxënës, Biznese, Vendosje, Ditari, Vlerësime.  
2. Rregulla biznesi: p.sh. nxënësi shkruan vetëm ditarin e vet; biznesi vlerëson vetëm të vendosurit e tij.  
3. Soft-delete ku duhet (audit).

### Faza B4 — Raporte (2 ditë)
1. Endpointë agregimi për panel.  
2. Export Excel / PDF server-side ose stream.

### Faza B5 — Hardening (2 ditë)
1. Rate limit login.  
2. Validim me Zod/Joi.  
3. Logging (pino) + request id.  
4. Backup hook / script.

**Deliverable backend:** API REST i dokumentuar (OpenAPI i thjeshtë ose README endpoints).

---

## 5. Baza e të dhënave

### 5.1 Entitetet kryesore

| Tabela | Fusha kryesore |
|--------|----------------|
| `users` | id, email, password_hash, role, active, last_login |
| `students` | user_id?, emri, klasa, drejtim_id, status |
| `businesses` | emri, NUI?, kontakt, email, telefon, kapacitet, fusha |
| `placements` | student_id, business_id, mentor_name, start/end, status |
| `diary_entries` | placement_id, date, hours, activity, approved_by |
| `evaluations` | placement_id, scores JSON, comment, by_user_id |
| `departments` / `drejtimet` | kod, emër |
| `audit_logs` | actor, action, entity, meta, created_at |
| `consents` | student_id, type, accepted_at |

### 5.2 Hapësat DB

1. Dizajno ERD (1 ditë).  
2. Implemento Prisma schema + indekse (email unik, FK, status).  
3. Seed drejtimet nga `data/drejtimet.json`.  
4. Script migrimi nga localStorage demo → CSV → import (një herë).  
5. Politika backup: `pg_dump` ditor + ruajtje 14 ditë në disk / Drive.

### 5.3 Optimizim DB

- Indekse në `placements(student_id)`, `placements(business_id)`, `diary_entries(placement_id, date)`.  
- Paginate listat (`LIMIT/OFFSET` ose cursor).  
- Mos ruaj file të mëdha në DB — vetëm path në disk.

---

## 6. Autentifikim, role & siguri

| Roli | Të drejta tipike |
|------|------------------|
| `admin` | Gjithçka, përdoruesit, konfigurimi |
| `coordinator` | Nxënës, biznese, vendosje, raporte |
| `business` | Lista e nxënësve të vendosur, aprovim ditari, vlerësim |
| `student` | Profili, ditari, shikim vendosjeje |

**Siguria (minimum i detyrueshëm):**
1. HTTPS overallt.  
2. Fjalëkalime të hash-uara.  
3. Cookie HttpOnly + SameSite për refresh.  
4. CORS i kufizuar në domain-in e shkollës.  
5. Headers: Helmet.  
6. Backup + restore testuar 1 herë.  
7. Ndarje e të dhënave personale (minimizon fushat e ekspozuara në raporte publike).  
8. Log i hyrjeve të dështuara.

---

## 7. Optimizimi (performance & kosto)

1. **Frontend:** Vite build, gzip/brotli në Nginx, cache assets me hash.  
2. **API:** indekse DB, select vetëm kolonat e nevojshme, cache panel KPI 60s (në memorie).  
3. **Imazhet:** logo e optimizuar (WebP/JPEG e vogël).  
4. **Monitoring i lirë:** UptimeRobot (free) + log në server.  
5. **Mos shto Redis** derisa të ketë nevojë reale (kursen kompleksitet).  
6. **Një VPS** derisa concurrent users < ~100 — mjafton për shkollë.

---

## 8. DevOps & CI/CD

### 8.1 Repos

- Opsion A (i thjeshtë): monorepo `frontend/` + `api/` + `docs/`.  
- Branch: `main` = production, `develop` = staging (opsional).

### 8.2 Pipeline (GitHub Actions)

1. `npm ci` + lint + test.  
2. Build frontend.  
3. SSH deploy në VPS:  
   - pull  
   - `prisma migrate deploy`  
   - restart API  
   - kopjo `dist/` në `/var/www/praktika`

### 8.3 Ambjente

| Ambient | URL tipike | Qëllimi |
|---------|------------|---------|
| Local | localhost | Zhvillim |
| Staging (opsional) | staging.praktika… | Test me shkollën |
| Production | praktika.iaapsl.com | Live |

### 8.4 Hapësat DevOps

1. Provision VPS + firewall (22, 80, 443).  
2. Instalo Node, Postgres, Nginx.  
3. Certbot TLS.  
4. Systemd unit për API.  
5. Cron `pg_dump`.  
6. GitHub Actions deploy key.  
7. Dokumento runbook: restart, restore, ndryshim env.

---

## 9. Hosting, domain & email

### 9.1 Hosting (i lirë / i qëndrueshëm)

| Opsion | Çmim orientues | Shënim |
|--------|-----------------|--------|
| **Hetzner CX22** (rekomanduar) | ~€4–6 / muaj | BE, SSD, i mjaftueshëm |
| Contabo VPS S | ~€5 / muaj | Alternativë |
| Railway / Render free | €0 fillimisht | Rrezik sleep / limite — jo ideal për tender |

**Rekomandim:** Hetzner (Falkenstein/Helsinki) — 1 VPS për 12 muaj ≈ **€50–70/vit**.

### 9.2 Domain

| Opsion | Kosto | Rekomandim |
|--------|-------|-----------|
| Subdomain `praktika.iaapsl.com` | €0 | **Më i miri** — shkolla e kontrollon DNS |
| Domain i ri `.com` | ~€10–15/vit | Nëse duan brand të veçantë |
| `.ks` / registrar lokal | varion | Nëse kërkohet institucionalisht |

### 9.3 Email

- Njoftime sistemike: Brevo / Zoho free (300 email/ditë mjafton).  
- Email support: adresa e shkollës (`praktika@iaapsl.com` nëse ekziston).

### 9.4 Hapësat hosting

1. Merre akses DNS nga shkolla (ose krijo subdomain).  
2. A-record → IP e VPS.  
3. Certbot.  
4. Verifiko HTTPS + redirect HTTP→HTTPS.  
5. Shto në monitorim uptime.

---

## 10. Plan biznesor & dorëzimi

### 10.1 Faza kontraktuale (milestones)

| Milestone | % pagesë tipike | Çfarë dorëzohet |
|-----------|-----------------|-----------------|
| M1 – Kickoff & dizajn | 20% | Plan, ERD, wireframe konfirmim, akses server |
| M2 – Backend + DB + Auth | 30% | API + login + CRUD bazë në staging |
| M3 – Frontend i lidhur | 25% | App e plotë në staging |
| M4 – Go-live + trajnim | 15% | Production + manual + 1 sesion trajnimi |
| M5 – Stabilizim (30 ditë) | 10% | Bugfix + handover |

*(Përqindjet janë të negociueshme; shih Excel-in e parametrave.)*

### 10.2 Kohëzgjatja e rekomanduar

| Faza | Kohëzgjatje |
|------|-------------|
| Kickoff + setup infra | 1 javë |
| Backend + DB | 2–3 javë |
| Frontend integration | 2 javë |
| Test me shkollën | 1 javë |
| Go-live + trajnim | 3–5 ditë |
| **Total** | **~6–8 javë** (1 zhvillues full-time) |

Me 2 persona (FE+BE paralel): **4–5 javë**.

### 10.3 Dorëzimet formale

1. Kodi burimor (GitHub private ose transfer te shkolla).  
2. Kredencialet admin + dokumenti i aksesit.  
3. Manuali i përdoruesit (PDF, shqip) — 8–12 faqe.  
4. Manuali teknik (deploy, backup).  
5. Sesion trajnimi 2–3 orë (koordinatorët + 1 admin).  
6. 30 ditë garanci bugfix (pas go-live).

### 10.4 Mirëmbajtja (pas projektit)

Paketa mujore e lehtë (opsionale):
- Backup check  
- Update sigurie  
- 2–4 orë ndryshime të vogla  
**Çmim orientues:** €40–80 / muaj (shih Excel).

---

## 11. Roadmap i implementimit (hapat që do të ndjekë AI + ti)

Ky është rendi i ekzekutimit pas miratimit të planit dhe cmimit:

### Hapi 1 — Infra & repo
- [ ] Strukturo monorepo (`api/`, `frontend/` ose rrënja aktuale, `docs/`)  
- [ ] `.env.example`, README production  
- [ ] Prisma + Postgres lokal (Docker opsional)

### Hapi 2 — Database & Auth
- [ ] Schema e plotë  
- [ ] Migrime + seed  
- [ ] Login / JWT / role guards

### Hapi 3 — API modules
- [ ] Students, Businesses, Placements  
- [ ] Diary, Evaluations  
- [ ] Dashboard stats + reports export

### Hapi 4 — Frontend wiring
- [ ] API client  
- [ ] Auth screens  
- [ ] Zëvendëso localStorage modul-pas-moduli  
- [ ] Role-based navigation

### Hapi 5 — DevOps
- [ ] VPS + Nginx + TLS  
- [ ] Deploy script / GitHub Action  
- [ ] Backup cron

### Hapi 6 — Domain & go-live
- [ ] DNS subdomain  
- [ ] Seed production (admin + drejtime)  
- [ ] Import nxënës/biznese reale (CSV)  
- [ ] Soft launch me 1 drejtim pilot

### Hapi 7 — Trajnim & mbyllje
- [ ] Manual PDF  
- [ ] Trajnim  
- [ ] Lista e njohurive / handover  
- [ ] Oferta mirëmbajtjeje

> **Rregull:** nuk fillojmë kod production derisa ti të thuash “fillo implementimin” dhe të konfirmosh variantin e cmimit nga Excel.

---

## 12. Menaxhimi i rrezikut

| Rrezik | Mitigim |
|--------|---------|
| Shkolla vonon DNS / server | Fillojmë me staging në subdomain të përkohshëm |
| Të dhëna jo të pastra (Excel) | Template CSV + validim importi |
| Scope creep | Lista “Faza 2” e shkruar në kontratë |
| Një VPS bie | Backup ditor + restore i dokumentuar (<1 orë RTO) |
| Buxhet i ulët | Stack i thjeshtë, pa React rewrite, pa cloud i shtrenjtë |

---

## 13. KPI suksesi (pas 1 muaji live)

- ≥ 90% e nxënësve të praktikës të regjistruar në sistem  
- ≥ 70% e ditareve të plotësuara javore  
- Raporti mujor gjenerohet < 2 minuta  
- Zero humbje të dhënash (backup i verifikuar)  
- Koha e përgjigjes API p95 < 300ms në VPS

---

## 14. Lidhja me dokumentin e cmimit

Skedari: **`docs/parametrat-cmimi-tender.xlsx`** (krijohet pas miratimit)

**Pse jo shumë lirë:** sistemi ka **5 role** (drejtor, koordinator, mentor shkolle, mentor biznesi, nxënës) me leje, ekrane dhe workflow të ndryshme (~330 orë × €20 ≈ kosto reale €6k+).

| Skenari | Pa TVSH | Me TVSH 18% |
|---------|---------|-------------|
| Minimal | **€4.990** | ~€5.888 |
| **Rekomanduar (oferta kryesore)** | **€6.490** | ~€7.658 |
| Me mirëmbajtje 12 muaj | **€7.990** | ~€9.428 |

Përmban: parametra të ndryshueshëm, zëra me formula, rresht RBAC/multi-role, TVSH on/off.

**Strategjia:** nën cmimin e firmave (€10k–20k), por **mbi dyshemenë e orëve** — oferta që duhet paraqitur: **€6.490**.

---

## 15. Kontakte & next step

1. Rishiko këtë plan (30–45 min me shkollën).  
2. Hap Excel-in, rregullo tarifat në fletën **PARAMETRAT**.  
3. Zgjidh skenarin e ofertës (Minimal / Rekomanduar).  
4. Shkruaj në chat: **“fillo implementimin – skenari X”**.  

Pas kësaj, implementimi vazhdon **hap pas hapi** sipas seksionit 11.
