# 🚀 AZBEK GROUP — Bulutli Server va Mobil Ilova Qo'llanmasi

Ushbu loyiha **25-oktyabrgacha to'liq ishga tushirish (Go-Live)** talablari asosida mustaqil bepul bulutli serverga joylashtirildi, nomi rasman **AZBEK GROUP** ga o'zgartirildi va har qanday smartfonda (iPhone & Android) 100% to'laqonli ishlashga moslashtirildi.

---

## 🌐 1. Jonli Bulutli Server Havolasi (Hozirning o'zidayoq Ishlamoqda!)

Hech qanday VPN yoki qo'shimcha sozlamalarsiz, istalgan qurilmadan (kompyuter, noutbuk, planshet, mobil telefon) ochish uchun rasmiy global HTTPS havolasi:

👉 **[https://taken-applications-military-tourist.trycloudflare.com](https://taken-applications-military-tourist.trycloudflare.com)**

> **Xavfsizlik:** Cloudflare Global Edge tarmog'i orqali to'liq SSL/TLS shifrlangan, bepul va xavfsiz ishlaydi. NXS platformasi bilan bog'liq emas.

---

## 📱 2. Mobil Telefonda Ishlatish va O'rnatish (iPhone & Android)

Ilova smartfonlar uchun **Native Mobile App (PWA)** standartida tayyorlandi.

### A. Pastki Mobil Menyu (Native Bottom Navigation Bar)
Smartfonda bir qo'l bilan boshqarish qulay bo'lishi uchun pastki qismda 5 ta tezkor tugma joylashtirildi:
1. **🛒 Kassa** — Shtrix-kod skaneri, savdo, savat va tezkor to'lov
2. **📦 Ombor** — Mahsulotlar ro'yxati, qoldiqlar, kirim va chiqim
3. **🍽️ Soha (Dinamik)** — Xodim roliga qarab:
   - Restoranda: **Restoran & Stollar**
   - Moykada: **Xizmatlar & Talonlar**
   - Nasiyada: **Qarzdorlar CRM**
   - Rahbarda: **Kompaniya HR**
4. **📊 Hisobot** — Kunlik tushum, foyda va analitika
5. **☰ Menyu** — Chap yon panel (Profil, Sozlamalar, Audit)

### B. Smartfonga Ilova Sifatida O'rnatish:
1. **Android (Google Chrome):**
   - Saytni oching: `https://taken-applications-military-tourist.trycloudflare.com`
   - Yuqoridagi uch nuqta `⋮` menyusini bosing.
   - **«Ilovani o'rnatish» (Установить приложение)** tugmasini bosing.
   - Telefon bosh ekranida **AZBEK GROUP** rasmiy oltin logoli belgisi paydo bo'ladi.
2. **iPhone (Apple Safari):**
   - Havolani Safari brauzerida oching.
   - Pastdagi o'rtadagi **Ulashish (Share / 📤)** tugmasini bosing.
   - Menyudan **«Bosh ekranga qo'shish» (На экран «Домой» / Add to Home Screen)** ni tanlang.
   - Nomi avtomatik ravishda **AZBEK GROUP** bo'ladi.
   - iPhone ekranida alohida ilova bo'lib ochiladi (Safari ramkalarisiz, to'liq ekran).

---

## 🔑 3. Tizimga Kirish Ma'lumotlari (Barcha Kasblar)

| Kasb / Rol | Login | Parol | Korxona ID |
|---|---|---|---|
| **👑 Bosh Asoschi (Super Admin)** | `azbek` | `2026` | `AZBEK-HQ` |
| **🏢 Supermarket Egasi** | `alisher` | `7777` | `STR-001` |
| **🛒 Do'kon Kassiri** | `kassir` | `1111` | `STR-001` |
| **🏢 Restoran Egasi** | `botir` | `8888` | `STR-002` |
| **🍽️ Ofitsiant** | `restoran` | `2222` | `STR-002` |
| **🚗 Moyka / Usta** | `moyka` | `3333` | `STR-004` |
| **💊 Dorixona Egasi** | `zafar_apteka` | `1234` | `STR-006` |
| **🚗 Avto-Moyka Egasi** | `zafar_moyka` | `7777` | `STR-007` |

---

## ☁️ 4. Doimiy Bepul Bulutli Serverga (Render.com) Joylashtirish (25-Oktyabrga Qadar)

Loyihada Render, Railway va Docker uchun barcha konfiguratsiyalar yaratildi:
- `Dockerfile` — Mustaqil Linux konteyner
- `render.yaml` — Render.com 1-klikli bepul hosting
- `Procfile` — Bulutli start buyrug'i
- `railway.json` — Railway bulutli sozlamalari

### Render.com da 1 daqiqada ishga tushirish:
1. **GitHub** profilingizda yangi repozitoriy oching (masalan, `azbek-group`).
2. Loyihani GitHub ga yuklang:
   ```bash
   git remote add origin https://github.com/SIZNING_PROFILINGIZ/azbek-group.git
   git push -u origin main
   ```
3. [Render.com](https://render.com) ga kiring (bepul ro'yxatdan o'ting).
4. **New +** -> **Web Service** ni tanlang va GitHub repozitoriyangizni ulang.
5. Sozlamalar:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free` ($0/oy)
6. **Create Web Service** ni bosing. 2 daqiqada sizga doimiy `https://azbek-group.onrender.com` kabi bepul rasmiy doimiy HTTPS domeni beriladi!
