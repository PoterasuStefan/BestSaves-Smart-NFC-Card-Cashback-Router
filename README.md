<div align="center">

# 💳 BestSaves · Smart NFC Card & Cashback Router
### *„One Card to Rule Them All” — Atingi un singur card fizic la POS. Noi rutăm plata automat către cardul care îți dă cel mai mare cashback.*

[![BestSaves](https://img.shields.io/badge/BestSaves-VibeHack_2026-10b981?style=for-the-badge&logo=contactlesspayment)](https://github.com/PoterasuStefan/money-compass-chat)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Capacitor 8](https://img.shields.io/badge/Capacitor-8-1192d4?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
[![Web NFC](https://img.shields.io/badge/Web%20NFC-Enabled-00C853?style=flat-square)](https://w3c.github.io/web-nfc/)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20On--Device-success?style=flat-square)](https://github.com/PoterasuStefan/money-compass-chat)

<p align="center">
  <b>Bani în plus. Nu sfaturi în plus.</b><br>
  Nu mai lăsa bani pe masă la casă. BestSaves este companionul financiar autonom care găsește oportunitățile bancare pe care le ratezi în fiecare zi.
</p>

[✨ Smart Card & NFC POS](#-noutate-bestsaves-smart-card--simulator-pos-nfc) • [🚀 Funcționalități](#-funcționalități-principale) • [🧠 Arhitectură](#-arhitectură--cum-funcționează-smart-routing-ul) • [🛠️ Rulare Locală](#-instalare-și-rulare-locală) • [👥 Echipa](#-echipa)

</div>

---

## ⚡ Problema: Banii pe care îi lași pe masă

Majoritatea românilor dețin între **2 și 4 carduri bancare** (ex. BT, BCR, ING, Revolut). Băncile oferă promoții masive de cashback (3% - 10%), reduceri la benzinării sau puncte de loialitate, dar:
* Sunt îngropate în **PDF-uri de 40 de pagini** și campanii promoționale fragmentate.
* Când ești la casa de marcat la Carrefour sau la pompă la OMV, **nu ai timp să verifici ce card e optim**.
* În fiecare lună, un utilizator activ pierde între **200 și 500 RON** din beneficii ratate și abonamente uitate.

---

## 🌟 Noutate: BestSaves Smart Card & Simulator POS NFC

Punctul culminant al proiectului este **eliminarea completă a deciziei manuale la casă** printr-un card fizic inteligent și un modul de rutare dinamică:

### 🎯 Cum funcționează experiența POS:
1. **Un Singur Card Fizic (`#BS-NFC-01`)**: În loc să scoți pe rând cardurile din portofel sau telefon, atingi la POS un singur card contactless BestSaves.
2. **Identificare Automată a Comerciantului**: Terminalul POS detectează instant magazinul (ex: *Carrefour*, *OMV*, *eMAG*, *Mega Image*).
3. **Smart Routing Engine în Timp Real**:
   * Motorul analizează matricea de beneficii a tuturor cardurilor tale conectate.
   * Calculează oferta cu cel mai mare randament financiar (ex: 5% Cashback BT vs. 1% ING).
   * **Redirecționează debitarea tranzacției către cardul bancar câștigător.**
4. **Hardware & Web NFC Nativ**:
   * **Web NFC API (`NDEFReader`)**: Pe dispozitive Android compatibile (Chrome), poți atinge un card NFC fizic de spatele telefonului pentru a declanșa plata reală pe ecran.
   * **Simulator POS Interactiv**: Interfață vizuală de terminal POS cu selector de sumă, comerciant, animații de rezonanță radio și pași detaliați de rutare.
   * Sincronizare automată a tranzacției și cashback-ului în istoricul Seifului.

```text
 ┌────────────────────────────────────────────────────────┐
 │            Atingere Smart Card BestSaves               │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │       Terminal POS: Carrefour • Total 240 RON          │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │             BestSaves Smart Routing Matrix             │
 │  • BT Card:  5% Cashback Carrefour  ──► [CÂȘTIGĂTOR]   │
 │  • ING Card: 1% Cashback General                       │
 │  • BCR Card: 0% Promoție activă                        │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │   ✅ Plată Aprobată: Debitat din Banca Transilvania    │
 │   💰 +12.00 RON Cashback salvat instant în portofel    │
 └────────────────────────────────────────────────────────┘
```

---

## 🚀 Funcționalități Principale

### 1. 🛡️ The Vault (Seiful Meu)
* **Toate cardurile într-un singur loc**: Vizualizare unificată, modernă, tip portofel digital a întregului tău portofoliu bancar.
* **Procesare Locală a Extraselor (CSV / PDF)**: Suport pentru extrase bancare reale de debit și credit (inclusiv PDF-uri de la BCR).
* **3 Stiluri de Viață Pre-configurate**: Buton demo pentru testare instantanee cu profil de *Freelancer*, *Familie* sau *Profesionist urban*.

### 2. 📍 Geofencing & Notificări Ambientale la Checkout
* Prin `@capacitor/geolocation`, aplicația recunoaște când te afli fizic într-un supermarket sau lanț partener (Lidl, Kaufland, Carrefour, Profi, Zara, Decathlon etc.).
* La 5 minute de la intrare, primești o notificare ambientală pe ecran: *„Ești la Carrefour? Folosește cardul BT pentru 5% cashback.”*

### 3. 🔪 Zombie Subscription Killer
* Analizează extrasul bancar și semnalează abonamentele recurente care îți golesc contul (Adobe Creative Cloud, ChatGPT Plus, Spotify, Netflix etc.).
* **Alternative Gratuite**: Îți recomandă alternative open-source (ex: *GIMP + Krita* în loc de Adobe, modele locale *Ollama*).
* **1-Click Cancel**: Buton direct către pagina de anulare a furnizorului.

### 4. 🔒 Privacy by Design (100% Client-Side)
* Fără stocare de credențiale bancare pe servere.
* Datele din extras, regulile de rutare și istoricul tranzacțiilor rulează exclusiv în browser și în stocarea locală protejată a dispozitivului.

---

## 🏗️ Stack Tehnologic

| Strat | Tehnologii Folosite |
|---|---|
| **Frontend Core** | React 19, TypeScript, Vite, TanStack Router |
| **Mobile & Hardware** | Capacitor 8, `@capacitor/geolocation`, `@capacitor/local-notifications` |
| **Hardware NFC** | **Web NFC API** (`window.NDEFReader`) pentru citire fizică de tag-uri/carduri contactless |
| **Design & UI** | Tailwind CSS, Radix UI Primitives, Lucide Icons |
| **State & Storage** | Zustand, LocalStorage securizat, detecție deterministă |
| **Testare** | Vitest (suite automate pentru logica de rutare și parsing extrase) |

---

## 🚀 Instalare și Rulare Locală

### Cerințe preliminare
* [Node.js](https://nodejs.org/) (v20+) sau [Bun](https://bun.sh/) (recomandat)

### 1. Clonare repository
```bash
git clone https://github.com/PoterasuStefan/money-compass-chat.git
cd money-compass-chat
```

### 2. Instalare dependințe
```bash
bun install
# sau: npm install
```

### 3. Pornire server local
```bash
bun run dev
# sau: npm run dev
```
Accesează `http://localhost:5173` în browser. Pentru a testa funcționalitatea NFC nativă, deschide adresa în Google Chrome pe un dispozitiv Android cu NFC activat.

### 4. Rulare teste unitare
```bash
bun test
```

---

## 📱 Compilare Aplicație Nativă Android

Proiectul conține structura complet configurată Capacitor pentru Android:

```bash
# 1. Build producție
bun run build

# 2. Sincronizare cu proiectul Android
bun x cap sync android

# 3. Deschidere în Android Studio
bun x cap open android
```

Pentru a asambla fișierul `.apk` direct din consolă:
```bash
cd android
./gradlew assembleDebug
```
APK-ul compilat se va găsi în: `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🤝 Model de Business: Triplu Câștig (3-Way Win)

| Actor | Beneficiu |
|---|---|
| 🛒 **Consumatori** | Salvează sute de lei anual automat, fără efort și fără calcule mentale. |
| 🏦 **Bănci** | Tracțiune directă pentru campaniile lor de beneficii; clienții chiar le folosesc cardurile la comercianții parteneri (crește volumul de interchange). |
| ⚡ **BestSaves** | Monetizare prin comisioane de referral la deschiderea de carduri noi, afilieri comerciale și volum tranzacționat. |

---

## ⚖️ Disclaimer
*Acest prototip a fost dezvoltat în cadrul unui hackathon. Toate conturile bancare, tranzacțiile și simulările de carduri contactless sunt generate în medii de testare și nu utilizează date financiare reale.*

---

<div align="center">

Dezvoltat cu pasiune de **Divizia stricăciuni** 🚀

</div>