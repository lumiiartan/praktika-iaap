# Praktika – IAAP Skënder Luarasi

Platformë demonstruese për menaxhimin e praktikës profesionale në IAAP «Skënder Luarasi», Suharekë.

**Demo – të gjitha të dhënat janë fiktive.**

## Çka është

Zëvendëson ditarët në letër, Excel-in dhe WhatsApp-in me një pamje të përbashkët për:

- koordinatorin e Qendrës së Karrierës
- drejtorin
- mësimdhënësin mentor
- mentorin në biznes
- nxënësin

Është «motër» e demos [Bursat Suharekë](https://lumiiartan.github.io/bursat-suhareke/), por me identitetin vizual të shkollës nga [iaapsl.com](https://www.iaapsl.com/): blu `#0f3a67`, ari `#d8ab3f`, Montserrat dhe logoja zyrtare.

## Si ta hapni lokalisht

Nuk ka `npm install`. Hapni një server statik në rrënjën e projektit (module ES kërkojnë http, jo `file://`):

```bash
cd praktika-iaap-skender-luarasi
python3 -m http.server 5174
```

Pastaj hapni: http://127.0.0.1:5174/

## Struktura

```
index.html
css/           # stilimi, dark mode, print A4
js/app.js      # router (#/paneli, #/bizneset, …)
js/store.js    # localStorage + rivendosja
js/views/      # ekranet
data/drejtimet.js   # 8 drejtime – TO CONFIRM
data/seed.js        # ~120 nxënës, ~25 biznese fiktive
assets/
```

## Si të ndryshoni drejtimet

Hapni `data/drejtimet.js`. Për çdo profil ndryshoni `name`, `code`, `color` dhe listën `skills`. Shënimi `TO CONFIRM` kujton që emrat janë shembull derisa shkolla t’i verifikojë.

Pastaj shtypni **Rivendos demon** në aplikacion (ose fshini `localStorage` key `praktika-iaap-v1`).

## Si të ndryshoni të dhënat demo

Logjika e gjenerimit është në `data/seed.js` (emra, fshatra, biznese, periudha, ditare). Pas ndryshimit: rivendosni demon.

## Publikimi në GitHub Pages

1. Krijoni repo publike dhe ngarkoni këtë folder.
2. Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`.
3. Nëse faqja jeton në nënrrugë (`/emri-repo/`), shtoni në `index.html` një `<base href="/emri-repo/">` ose përshtatni lidhjet relative (aktualisht janë relative `./`).

## Udhëzuesi i takimit (10 min)

1. Roli **Drejtori** → paneli me alerta dhe grafikë  
2. **Koordinatori** → Vendosja → Era Hoxha → Cakto  
3. **Nxënësi** → Ditari → dërgo shënimin  
4. **Mentori në biznes** → Aprovo javën  
5. **Koordinatori** → Raportet → Vërtetim + Raport për donatorë  

## Çka mungon për pilot real

Server dhe baza e të dhënave nën kontrollin e shkollës/komunës, kyçje e vërtetë, marrëveshje për mbrojtjen e të dhënave, dhe lidhje e kujdesshme me SMIA/e-Shkollorin (pa dyfishim).
