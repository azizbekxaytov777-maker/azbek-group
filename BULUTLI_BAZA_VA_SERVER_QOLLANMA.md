# AZBEK GROUP — Bulutli Baza (MongoDB Atlas & Supabase) va Serverni Ko'chirish Qo'llanmasi

Ushbu hujjat **AZBEK Universal Business Super-App** tizimini bulutli ma'lumotlar bazalariga (**MongoDB Atlas** yoki **Supabase**) ulash, shuningdek kelajakda o'zingizning shaxsiy serveringizga (VPS yoki ofisdagi kompyuterga) butun tizimni va ma'lumotlar bazasini 100% mustaqil ko'chirish bo'yicha to'liq qo'llanmadir.

---

## 1. Bulutli Baza Nega Kerak?

* **Render.com bepul serveri xususiyati:** Render'da bepul server har safar yangi kod yuklanganda yoki qayta yoqilganda o'zining vaqtinchalik xotirasini tozalaydi.
* **Yechim:** Ma'lumotlarni tashqi bulutli bazaga (**MongoDB Atlas** yoki **Supabase**) ulaganingizda, tovarlar, kassadagi sotuvlar, qarzlar va mijozlar hech qachon yo'qolmaydi.
* **Avtomatik Sinxronizatsiya:** Serverimiz har bir sotuv yoki o'zgarish sodir bo'lishi bilan uni avtomatik ravishda MongoDB Atlas yoki Supabase'ga zaxiralab boradi.

---

## 2. 1-USUL: MongoDB Atlas'ga Ulanish (ENG TAVSIYA ETILADIGAN USUL)

AZBEK ilovasi hujjatli JSON modelida ishlagani uchun MongoDB unga **1:1 mukammal tushadi**.

### Qadamlar:
1. [mongodb.com](https://www.mongodb.com/) saytiga kiring va bepul ro'yxatdan o'ting.
2. **"Create Deployment"** ➔ **"M0 Free Cluster"** (bepul 512 MB) ni tanlang.
3. **"Security" ➔ "Database Access"** bo'limiga o'ting:
   - Yangi foydalanuvchi qo'shing (masalan, `azbek` va mustahkam parol `parol123`).
4. **"Security" ➔ "Network Access"** bo'limiga o'ting:
   - **"Add IP Address"** ➔ **"Allow Access from Anywhere"** (`0.0.0.0/0`) ni tanlang va saqlang (Render serveri bemalol ulanishi uchun).
5. **"Clusters" ➔ "Connect"** tugmasini bosing:
   - **"Drivers"** (Node.js) ni tanlang.
   - Chiqqan ulanish havolasini (Connection String) nusxalang:
     ```text
     mongodb+srv://azbek:<parol>@cluster0.abcde.mongodb.net/azbek_superapp?retryWrites=true&w=majority
     ```
   - `<parol>` o'rniga o'zingiz qo'ygan parolni yozing.
6. **Render.com boshqaruv paneliga qo'shish:**
   - [dashboard.render.com](https://dashboard.render.com/) ga kiring.
   - O'zingizning `azbek-group` servisingizni oching.
   - Chap menyudan **"Environment"** bo'limiga o'ting.
   - **"Add Environment Variable"** ni bosing:
     - **Key:** `MONGODB_URI`
     - **Value:** `mongodb+srv://azbek:parol123@cluster0.abcde.mongodb.net/azbek_superapp?retryWrites=true&w=majority`
   - **"Save Changes"** ni bosing.
7. **Bo'ldi!** Render avtomatik ravishda yangi parametr bilan qayta ishga tushadi va dastur darhol MongoDB Atlas bulutiga ulanadi.

---

## 3. 2-USUL: Supabase (PostgreSQL)'ga Ulanish

Agar siz PostgreSQL platformasini afzal ko'rsangiz:
1. [supabase.com](https://supabase.com/) ga kiring va bepul ro'yxatdan o'ting.
2. **"New Project"** tugmasini bosib, yangi baza yarating.
3. Chap menyudan **"Project Settings" ➔ "API"** bo'limiga kiring:
   - **Project URL** (masalan: `https://xyzcompany.supabase.co`)
   - **Project API keys** (anon yoki `service_role` key) ni oling.
4. Render boshqaruv panelida **Environment** bo'limiga 2 ta o'zgaruvchi qo'shing:
   - **Key:** `SUPABASE_URL` | **Value:** `https://xyzcompany.supabase.co`
   - **Key:** `SUPABASE_KEY` | **Value:** `eyJh......`
5. Saqlang. Tizim avtomatik Supabase bulutiga ulanadi.

---

## 4. O'z Serveringizni Olsangiz Nima Bo'ladi? (Eng Muhim Savol)

> **Savol:** *Agar men kelajakda o'zimga shaxsiy server olsam, ilovani Render'dan chiqarib o'z serverimga o'tkazsam bo'ladimi? Bunda bulutli baza ham o'zimning serverimga o'tadimi?*

### Javob: **HA, 100% O'TADI VA JUDA OSON!**

Tizimimiz **hech qanday xorijiy servislarga qaram qilib bog'lanmagan**. Barcha kodlar ochiq Node.js drayverlarida yozilgan.

### 1-bosqich: Serverni o'zingizga ko'chirish
1. Siz O'zbekistondagi istalgan hosting provayderidan VPS olasiz (masalan, Uztelecom, Billur, ActiveCloud — oylik to'lovi 50 000 – 100 000 so'm atrofida) yoki do'koningizga bitta statsionar kompyuter qo'yasiz.
2. Serveringizga Node.js o'rnatasiz va GitHub'dagi loyihangizni yuklab olasiz:
   ```bash
   git clone https://github.com/azizbekxaytov777-maker/azbek-group.git
   cd azbek-group
   npm install
   ```
3. Ilovani uzluksiz fonda yurgizish uchun `pm2` dan foydalanasiz:
   ```bash
   npm install -g pm2
   pm2 start server.js --name azbek-app
   pm2 startup
   ```
   Endi sizning dasturingiz 100% o'zingizning serveringizda ishlaydi!

---

### 2-bosqich: Bulutli bazani ham o'zingizning serveringizga ko'chirish

Bulutdagi bazangizni o'z serveringizga ko'chirishning **2 ta juda qulay yo'li** bor:

#### A) MongoDB'ni o'z serveringizga to'liq o'rnatish (Eng professional yo'l):
1. O'z serveringiz ichiga bepul MongoDB Community Server o'rnatasiz:
   ```bash
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   ```
2. MongoDB Atlas bulutidagi barcha ma'lumotlarni 1 ta buyruq bilan fayl qilib ko'chirib olasiz:
   ```bash
   mongodump --uri="mongodb+srv://azbek:parol@cluster0.mongodb.net/azbek_superapp" --out=./baza_zaxira
   ```
3. O'z serveringizdagi mahalliy MongoDB'ga tiklaysiz:
   ```bash
   mongorestore --db=azbek_superapp ./baza_zaxira/azbek_superapp
   ```
4. Serveringizda `MONGODB_URI`ni quyidagicha qilib qo'yasiz:
   ```bash
   export MONGODB_URI="mongodb://localhost:27017/azbek_superapp"
   ```
   **Natija:** Barcha mijozlar, savdolar va tovarlar 100% o'zingizning kompyuteringizda bo'ladi! Tashqi internet yoki bulut butunlay uzib qo'yilsa ham tizim do'koningizda mustaqil ishlayveradi.

#### B) Bitta JSON fayl orqali ko'chirish (Eng oson 1 daqiqalik yo'l):
* Dasturimiz ichidagi `data/azbek_db.json` faylini nusxalab olasiz va yangi serveringizdagi `data/` papkasiga tashlab qo'yasiz.
* Yangi serverda dastur hech qanday bulutsiz ham ushbu fayldan barcha ma'lumotlarni bir zumda tiklab oladi.

---

## 5. Tavsiya: Gibrid Rejim (Xavfsizlik standarti)

Agar siz kelajakda o'zingizga server olsangiz ham, **ma'lumotlar bazasini MongoDB Atlas bulutida qoldirish** ko'pincha eng xavfsiz hisoblanadi:
* Nega? Chunki agar do'koningizdagi kompyuterga suv to'kilsa, qattiq diski (SSD) kuyib ketsa yoki elektr toki o'chib qolsa ham — **barcha savdolar va qarzdorlar ro'yxati bulutda omon qoladi**.
* Yangi kompyuter qo'yib ulasangiz, 5 soniyada hamma narsa yana o'z joyiga qaytadi.

---

## 6. Xulosa

Siz hozirdanoq MongoDB Atlas'ga ulab Render'da xotirjam ishlatishingiz mumkin. Qachonki biznesingiz kengayib o'zingizga alohida server sotib olsangiz, dasturni ham, bazani ham 15 daqiqada o'z serveringizga to'liq ko'chirib o'tkazib beramiz!
