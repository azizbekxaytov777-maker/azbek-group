# AZBEK ILOVASINI GOOGLE PLAY VA APP STORE'GA JOYLASHTIRISH BO'YICHA TO'LIQ QO'LLANMA

Ushbu loyiha **Universal PWA (Progressive Web App)** va **Capacitor Mobile Hybrid** arxitekturasida qurilgan bo'lib, bir vaqtning o'zida ikkala platformaga (Android va iOS) chiqarish uchun to'liq tayyorlangan.

---

## 1-USUL: TEZKOR VA BEPUL O'RNATISH (PWA / Bir zumda o'rnatish)
Hech qanday Google yoki Apple to'lovlarisiz mijozning telefoniga ilova sifatida o'rnatish:

1. Telefon brauzerida (Chrome, Safari, Samsung Internet) dastur manzilini oching (masalan: `http://sizning-ip-manzilingiz:6060`).
2. **Android (Samsung, Xiaomi va h.k.):**
   * Ekranning yuqorisidagi **"📲 O'rnatish"** tugmasini bosing yoki brauzer menyusidan (3 nuqta) **"Ilovani o'rnatish"** (Install App) bandini tanlang.
   * Ilova telefonda alohida mustaqil ilova bo'lib tushadi (Google Play'dan yuklangandek).
3. **iPhone (iOS / Safari):**
   * Safari'da pastdagi **"Ulashish (Share - kvadrat ichida o'q)"** tugmasini bosing.
   * Ro'yxatdan **"Bosh ekranga qo'shish" (Add to Home Screen)** ni bosing.
   * Ilova iPhone ish stolida to'liq original dastur sifatida paydo bo'ladi.
4. **Oflayn kafolat:** Ilova ochilgach, telefon interneti o'chirilgan bo'lsa ham **Service Worker** orqali 100% oflayn ishlaydi.

---

## 2-USUL: GOOGLE PLAY STORE (ANDROID) GA JOYLASHTIRISH (.APK / .AAB)

### 1-qadam: Google Play Console hisobi
* [play.google.com/console](https://play.google.com/console) saytidan $25 (bir martalik to'lov) to'lab dasturchi hisobi ochiladi.

### 2-qadam: TWA (Trusted Web Activity) yoki Bubblewrap orqali AAB yaratish (Eng osoni)
Google rasmiy vositasi `bubblewrap` yordamida:
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest=http://sizning-domen.uz/manifest.json
bubblewrap build
```
Bu buyruq sizga Google Play uchun tayyor `app-release-signed.aab` faylini beradi.

### 3-qadam: Capacitor orqali APK / AAB olish
```bash
cd azbek_mobile
npm install
npx cap add android
npx cap sync
npx cap open android
```
Android Studio avtomatik ochiladi -> **Build** -> **Generate Signed Bundle / APK** ni tanlab faylni yuklab olasiz va Google Play Console'ga yuklaysiz.

---

## 3-USUL: APPLE APP STORE (iOS) GA JOYLASHTIRISH (.IPA)

### 1-qadam: Apple Developer hisobi
* [developer.apple.com](https://developer.apple.com) saytidan ro'yxatdan o'tiladi (yiliga $99).

### 2-qadam: Capacitor orqali Xcode loyihasini yaratish
```bash
cd azbek_mobile
npx cap add ios
npx cap sync
npx cap open ios
```
Xcode ochiladi -> Apple Developer hisobingizni ulab -> **Product** -> **Archive** orqali App Store Connect'ga yuklaysiz.

---

## 👑 ASOSCHI UCHUN STRATEGIK TAVSIYA:
Boshlanishiga $25 yoki $99 sarflamasdan, **1-usul (PWA)** orqali har bir mijozning (restoran egasi, sotuvchi, haydovchi) telefoniga 10 soniyada o'rnatib bera olasiz. Mijoz uchun bu App Store yoki Google Play'dan yuklab olgandek bir xil ishlaydi, hech qanday xotirani to'ldirmaydi va 100% oflayn ishlaydi!
