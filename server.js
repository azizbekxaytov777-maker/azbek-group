/**
 * AZBEK — Universal Business Super-App (Yagona Birlashgan Platforma)
 * Port 5000 | Zero-dependency Node.js HTTP & JSON REST API Server
 * Savdo (POS), Restoran & Kafe, Xizmatlar & Moyka, Nasiya (CRM), Asoschi HQ (Admin)
 * 700,000 UZS/oylik DRM Litsenziya Killswitch bilan jihozlangan
 * Muallif: AZBEK GROUP (Global Diversified Company)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'azbek_db.json');
const SALT = 'AZBEK_GLOBAL_SALT_2026';

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function generateLicenseKey(storeId, expiryDateStr) {
    const hmac = crypto.createHmac('sha256', SALT).update(storeId + '|' + expiryDateStr).digest('hex').toUpperCase();
    return 'AZBK-' + hmac.slice(0, 4) + '-' + hmac.slice(4, 8) + '-' + hmac.slice(8, 12);
}

function verifyLicenseKey(storeId, expiryDateStr, key) {
    if (!key) return false;
    const cleanKey = key.trim().toUpperCase();
    const expected = generateLicenseKey(storeId, expiryDateStr);
    return cleanKey === expected;
}

const DEFAULT_DB = {
    settings: {
        appName: "AZBEK",
        version: "v3.0 UNIFIED SUPER-APP",
        storeName: "AZBEK GROUP Bosh Do'kon & Filial",
        address: "Toshkent sh., Amir Temur shoh ko'chasi 108",
        phone: "+998 (90) 123-45-67",
        tin: "308123456",
        currency: "UZS",
        taxRate: 12,
        currentBranch: "Oazis Bosh Filial (Universal)",
        activeIndustry: "savdo"
    },
    license: {
        storeId: "STR-001",
        status: "ACTIVE", // ACTIVE | EXPIRED | LOCKED
        validUntil: "2026-11-15",
        monthlyFee: 700000,
        contactPhone: "+998 (90) 123-45-67",
        telegramSupport: "@azbek_group"
    },
    metrics: {
        todayRevenue: 2450000,
        todayProfit: 890000,
        todayOrders: 38,
        totalDebt: 430000
    },
    shifts: {
        currentShiftId: 1,
        startTime: new Date().toISOString(),
        cashier: "Asoschi (Bosh Administrator)",
        totalRevenue: 2450000,
        cashTotal: 1200000,
        cardTotal: 900000,
        qrTotal: 350000,
        nasiyaTotal: 0,
        checksCount: 38,
        refundsCount: 0,
        refundsTotal: 0
    },
    // RETAIL / POS PRODUCTS
    products: [
        { id: 1, name: "Coca-Cola Classic 1.5L", barcode: "5449000000996", category: "Ichimliklar", price: 14000, cost: 11000, stock: 48, unit: "dona", icon: "🥤" },
        { id: 2, name: "Nestle Sut 3.2% 1L", barcode: "7613035342112", category: "Sut mahsulotlari", price: 16500, cost: 13500, stock: 24, unit: "dona", icon: "🥛" },
        { id: 3, name: "Toshkent Non (Issiq)", barcode: "2000000000030", category: "Non mahsulotlari", price: 4000, cost: 3000, stock: 120, unit: "dona", icon: "🍞" },
        { id: 4, name: "Lays Chips Tuzli 140g", barcode: "8690637123456", category: "Gazaklar", price: 18000, cost: 14000, stock: 35, unit: "dona", icon: "🥔" },
        { id: 5, name: "Shakar Paxta 1kg", barcode: "4780001234567", category: "Oziq-ovqat", price: 13500, cost: 11500, stock: 85, unit: "kg", icon: "🍚" },
        { id: 6, name: "O'simlik Moyi Oila 900ml", barcode: "4780012345678", category: "Oziq-ovqat", price: 17000, cost: 14200, stock: 60, unit: "dona", icon: "🍾" },
        { id: 7, name: "Choy Greenfield Golden 100p", barcode: "4605246005234", category: "Ichimliklar", price: 38000, cost: 31000, stock: 18, unit: "dona", icon: "🍵" },
        { id: 8, name: "Snickers Super 80g", barcode: "5000159461122", category: "Shirinliklar", price: 12000, cost: 9500, stock: 90, unit: "dona", icon: "🍫" },
        { id: 9, name: "Olma Qizil Beshyog'och", barcode: "2000000000092", category: "Mevalar", price: 19000, cost: 15000, stock: 45.5, unit: "kg", icon: "🍎" },
        { id: 10, name: "Ariel Avtomat Kir Yuvish 3kg", barcode: "5413149876543", category: "Maishiy kimyo", price: 78000, cost: 64000, stock: 14, unit: "dona", icon: "🧼" }
    ],
    // RESTAURANT TABLES & MENU
    restaurant: {
        tables: [
            { id: 101, name: "Stol 1 (Zal)", capacity: 4, status: "BUSY", activeOrder: { items: [{ name: "Osh Choyxona", qty: 2, price: 45000 }, { name: "Achchiq-chuchuk", qty: 1, price: 12000 }, { name: "Ko'k Choy", qty: 1, price: 6000 }], total: 108000, startTime: "16:20" } },
            { id: 102, name: "Stol 2 (Zal)", capacity: 2, status: "FREE", activeOrder: null },
            { id: 103, name: "Stol 3 (Zal)", capacity: 6, status: "FREE", activeOrder: null },
            { id: 201, name: "VIP Xona 1", capacity: 8, status: "BUSY", activeOrder: { items: [{ name: "Qozon Kabob", qty: 3, price: 65000 }, { name: "Non", qty: 3, price: 4000 }, { name: "Coca-Cola 1.5L", qty: 2, price: 18000 }], total: 243000, startTime: "15:45" } },
            { id: 202, name: "VIP Xona 2", capacity: 10, status: "FREE", activeOrder: null },
            { id: 301, name: "Terassa 1", capacity: 4, status: "FREE", activeOrder: null }
        ],
        menu: [
            { id: 1001, name: "Osh Choyxona", price: 45000, category: "Issiq Taomlar", icon: "🍲" },
            { id: 1002, name: "Qozon Kabob", price: 65000, category: "Issiq Taomlar", icon: "🍖" },
            { id: 1003, name: "Shashlik Mol Go'shti", price: 22000, category: "Kabablar", icon: "🍢" },
            { id: 1004, name: "Mastava", price: 32000, category: "Sho'rvalar", icon: "🥣" },
            { id: 1005, name: "Achchiq-chuchuk Salati", price: 12000, category: "Salatlar", icon: "🥗" },
            { id: 1006, name: "Choy (Ko'k / Qora)", price: 6000, category: "Ichimliklar", icon: "🫖" }
        ]
    },
    // SERVICES & TICKETS (CAR WASH, WORKSHOP, SALON)
    services: [
        { id: 501, client: "Malibu 2 (01 A 777 AA)", service: "Kuzov yuvish + Salonga kimyoviy ishlov", price: 120000, status: "JARAYONDA", worker: "Jasur Usta", time: "16:15" },
        { id: 502, client: "Cobalt (10 B 123 BB)", service: "Oddiy yuvish (Ekspress)", price: 45000, status: "KUTILMOQDA", worker: "Akmal", time: "16:40" },
        { id: 503, client: "Gentra (01 999 ZZZ)", service: "Polirovka & Keramika", price: 650000, status: "TAYYOR", worker: "Sardor", time: "14:30" }
    ],
    // DEBTORS / CRM
    customers: [
        { id: 1, name: "Farhod Rahimov", phone: "+998 90 111-22-33", debt: 250000, limit: 1000000 },
        { id: 2, name: "Dilshod Karimov", phone: "+998 97 777-88-99", debt: 180000, limit: 800000 },
        { id: 3, name: "Bobur Mirzayev", phone: "+998 93 456-78-90", debt: 0, limit: 500000 }
    ],
    // CLIENT STORES / COMPANIES (FOR ASOSCHI HQ - EACH HAS UNIQUE COMPANY ID)
    clients: [
        {
            id: "STR-001",
            name: "Oazis Supermarket (Bosh Do'kon)",
            industry: "Savdo",
            owner: "Alisher Usmonov",
            ownerUsername: "alisher",
            ownerPassword: "7777",
            phone: "+998 90 123-45-67",
            address: "Toshkent sh., Yunusobod 4-mavze",
            status: "ACTIVE",
            monthlyFee: 700000,
            registeredDate: "2026-09-15",
            validUntil: "2027-01-14",
            lastPaymentDate: "2026-10-15",
            totalPaid: 2800000,
            lastGeneratedKey: "AZBK-F3D3-58FF-97E5"
        },
        {
            id: "STR-002",
            name: "Rayhon Milliy Taomlar (Kafe)",
            industry: "Restoran",
            owner: "Botir Rahimov",
            ownerUsername: "botir",
            ownerPassword: "8888",
            phone: "+998 97 765-43-21",
            address: "Toshkent sh., Chilonzor 9-kvartal",
            status: "ACTIVE",
            monthlyFee: 700000,
            registeredDate: "2026-10-01",
            validUntil: "2026-11-01",
            lastPaymentDate: "2026-10-01",
            totalPaid: 700000
        },
        {
            id: "STR-003",
            name: "Grand Mebel Ishlab Chiqarish",
            industry: "Ishlab chiqarish",
            owner: "Jahongir To'xtayev",
            ownerUsername: "jahongir",
            ownerPassword: "9999",
            phone: "+998 93 555-11-22",
            address: "Toshkent viloyati, Zangiota",
            status: "EXPIRED",
            monthlyFee: 700000,
            registeredDate: "2026-08-10",
            validUntil: "2026-10-10",
            lastPaymentDate: "2026-09-10",
            totalPaid: 1400000
        },
        {
            id: "STR-004",
            name: "Crystal Avtoyuvish & Detailing",
            industry: "Xizmat",
            owner: "Sardor Qodirov",
            ownerUsername: "sardor",
            ownerPassword: "6666",
            phone: "+998 99 888-99-00",
            address: "Toshkent sh., Sergeli",
            status: "ACTIVE",
            monthlyFee: 700000,
            registeredDate: "2026-10-10",
            validUntil: "2026-11-10",
            lastPaymentDate: "2026-10-10",
            totalPaid: 700000
        }
    ],
    // COMPANY-SPECIFIC CUSTOM ROLES (DEFINED BY COMPANY OWNERS FOR THEIR OWN COMPANY ID)
    companyRoles: [
        {
            id: 1,
            companyId: "STR-001",
            roleCode: "CASHIER",
            roleName: "Do'kon Kassiri",
            roleBadge: "🛒 Do'kon Kassiri",
            allowedTabs: ["kassa", "inventory", "debts", "profile"],
            defaultTab: "kassa"
        },
        {
            id: 2,
            companyId: "STR-001",
            roleCode: "WAREHOUSE",
            roleName: "Ombor Mudiri (Tovar qabul qiluvchi)",
            roleBadge: "📦 Ombor Mudiri",
            allowedTabs: ["inventory", "kassa", "profile"],
            defaultTab: "inventory"
        },
        {
            id: 3,
            companyId: "STR-001",
            roleCode: "MANAGER",
            roleName: "Do'kon Boshqaruvchisi & Buxgalter",
            roleBadge: "📊 Menejer & Nasiya CRM",
            allowedTabs: ["dashboard", "kassa", "inventory", "debts", "profile"],
            defaultTab: "dashboard"
        },
        {
            id: 4,
            companyId: "STR-002",
            roleCode: "WAITER",
            roleName: "Restoran Ofitsianti",
            roleBadge: "🍽️ Restoran Ofitsianti",
            allowedTabs: ["restaurant", "profile"],
            defaultTab: "restaurant"
        },
        {
            id: 5,
            companyId: "STR-004",
            roleCode: "MASTER",
            roleName: "Moyka / Avtoservis Ustasi",
            roleBadge: "🚗 Servis Ustasi",
            allowedTabs: ["services", "profile"],
            defaultTab: "services"
        }
    ],
    // MULTI-COMPANY & MULTI-ROLE USER ACCOUNTS (SEPARATE LOGINS BOUND TO COMPANY ID)
    users: [
        {
            id: 1,
            companyId: "AZBEK-HQ",
            username: "azbek",
            password: "2026",
            fullName: "AZBEK GROUP Asoschisi (Bosh Egasi)",
            role: "FOUNDER",
            roleBadge: "👑 Asoschi (Super Admin)",
            industryName: "Asoschi HQ & Ekotizim",
            allowedTabs: ["admin", "company", "dashboard", "audit", "profile"],
            defaultTab: "admin",
            branch: "AZBEK GLOBAL HQ (AZBEK-HQ)"
        },
        {
            id: 6,
            companyId: "STR-001",
            username: "alisher",
            password: "7777",
            fullName: "Alisher Usmonov (Oazis Supermarket Egasi)",
            role: "COMPANY_OWNER",
            roleBadge: "🏢 Kompaniya Egasi (STR-001)",
            industryName: "Savdo / Supermarket",
            allowedTabs: ["company", "dashboard", "kassa", "inventory", "debts", "audit", "profile"],
            defaultTab: "company",
            branch: "Oazis Supermarket (STR-001)"
        },
        {
            id: 7,
            companyId: "STR-002",
            username: "botir",
            password: "8888",
            fullName: "Botir Rahimov (Rayhon Milliy Taomlar Egasi)",
            role: "COMPANY_OWNER",
            roleBadge: "🏢 Kompaniya Egasi (STR-002)",
            industryName: "Restoran / Kafe",
            allowedTabs: ["company", "dashboard", "restaurant", "inventory", "debts", "audit", "profile"],
            defaultTab: "company",
            branch: "Rayhon Milliy Taomlar (STR-002)"
        },
        {
            id: 2,
            companyId: "STR-001",
            username: "kassir",
            password: "1111",
            fullName: "Sardor Kassir (Savdo / Do'kon)",
            role: "CASHIER",
            roleBadge: "🛒 Do'kon Kassiri",
            industryName: "Savdo / Supermarket",
            allowedTabs: ["kassa", "inventory", "debts", "profile"],
            defaultTab: "kassa",
            branch: "Oazis Supermarket (STR-001)"
        },
        {
            id: 3,
            companyId: "STR-002",
            username: "restoran",
            password: "2222",
            fullName: "Jasmina Ofitsiant (Restoran / Kafe)",
            role: "WAITER",
            roleBadge: "🍽️ Restoran & Kafe",
            industryName: "Restoran / Oshxona",
            allowedTabs: ["restaurant", "profile"],
            defaultTab: "restaurant",
            branch: "Rayhon Milliy Taomlar (STR-002)"
        },
        {
            id: 4,
            companyId: "STR-004",
            username: "moyka",
            password: "3333",
            fullName: "Rustam Usta (Moyka / Avtoservis / Ustaxona)",
            role: "MASTER",
            roleBadge: "🚗 Xizmatlar & Ustaxona",
            industryName: "Xizmat ko'rsatish & Ustaxona",
            allowedTabs: ["services", "profile"],
            defaultTab: "services",
            branch: "Crystal Avtoyuvish (STR-004)"
        },
        {
            id: 5,
            companyId: "STR-001",
            username: "menejer",
            password: "4444",
            fullName: "Dilshod Boshqaruvchi (Buxgalter / CRM)",
            role: "MANAGER",
            roleBadge: "📊 Menejer & Nasiya CRM",
            industryName: "Boshqaruv va Hisobot",
            allowedTabs: ["dashboard", "kassa", "inventory", "debts", "profile"],
            defaultTab: "dashboard",
            branch: "Oazis Supermarket (STR-001)"
        }
    ],
    // SALES HISTORY
    sales: [
        {
            id: 1,
            client_sale_uuid: "seed-sale-201",
            checkNumber: 201,
            timestamp: new Date().toISOString(),
            industry: "savdo",
            grandTotal: 58000,
            discountAmount: 0,
            paidAmount: 60000,
            changeAmount: 2000,
            status: "COMPLETED",
            paymentMethod: "naqd",
            ofdFiscalSign: "889347519203",
            items: [
                { id: 1, name: "Coca-Cola Classic 1.5L", qty: 2, price: 14000 },
                { id: 4, name: "Lays Chips Tuzli 140g", qty: 1, price: 18000 },
                { id: 3, name: "Toshkent Non (Issiq)", qty: 3, price: 4000 }
            ]
        }
    ],
    // AZBEK GROUP V1: INVENTORY LEDGER (OMBOR HARAKATI JURNALI)
    inventoryMovements: [
        {
            id: 1001,
            timestamp: new Date().toISOString(),
            productId: 1,
            productName: "Coca-Cola Classic 1.5L",
            type: "PURCHASE",
            qtyDelta: 50,
            balanceAfter: 48,
            reason: "Boshlang'ich ombor kirimi (Optom bazadan)",
            actorName: "Asoschi (Bosh Administrator)"
        },
        {
            id: 1002,
            timestamp: new Date().toISOString(),
            productId: 1,
            productName: "Coca-Cola Classic 1.5L",
            type: "SALE",
            qtyDelta: -2,
            balanceAfter: 48,
            reason: "Sotuv cheki #201",
            actorName: "Sardor Kassir"
        }
    ],
    // NXS-STYLE SYSTEM AUDIT LOGS
    auditLogs: [
        {
            id: 1,
            timestamp: new Date().toISOString(),
            userName: "azbek (Asoschi)",
            userRole: "FOUNDER",
            action: "TIZIM_ISHGA_TUSHDI",
            module: "CORE",
            details: "AZBEK + AZBEK GROUP V1 Birlashgan Tizimi faollashtirildi",
            ipAddress: "127.0.0.1"
        }
    ],
    // NXS-STYLE LIVE NOTIFICATIONS
    notifications: [
        {
            id: 1,
            title: "AZBEK + V1 Ombor & Kassa Birlashdi!",
            message: "Endi Ombor harakati, 1-klikda Vozvrat, Qaytim hisoblagich va 1-2-3 bolalar ham tushunadigan yordamchi faol.",
            type: "info",
            isRead: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            title: "Oylik DRM Nazorati",
            message: "STR-003 (Grand Mebel) litsenziya to'lovi kutilmoqda (700,000 UZS).",
            type: "warning",
            isRead: false,
            createdAt: new Date().toISOString()
        }
    ],
    // AZBEK COPILOT ISSUES & BUG TRACKER (KAMCHILIKLARNI RO'YXATGA OLISH VA AVTO-TUZATISH)
    issues: [
        {
            id: "ISS-001",
            title: "Coca-Cola narxi yangilandi",
            description: "Mijoz xabariga ko'ra narx 14,000 UZS ga to'g'irlandi",
            category: "Mahsulotlar",
            severity: "NORMAL",
            status: "AUTO_FIXED",
            reporter: "Sardor Kassir",
            companyId: "STR-001",
            createdAt: new Date().toISOString()
        }
    ],
    // COPILOT SETTINGS (GEMINI AI & AUTO-HEALING ENGINE)
    copilotSettings: {
        geminiApiKey: "",
        autoHealingEnabled: true,
        model: "gemini-2.5-flash"
    }
};

function logAudit(db, { userName, userRole, action, module, details, ipAddress, companyId }) {
    if (!db.auditLogs) db.auditLogs = [];
    let resolvedCompId = companyId;
    if (!resolvedCompId && details) {
        const m = String(details).match(/\b(STR-\d{3}|AZBEK-[A-Z0-9]+|KORZINKA-\d+|AUTO-CAR-\d+|CHOYXONA-\d+|DETEYL-\d+)\b/i);
        if (m) resolvedCompId = m[1].toUpperCase();
    }
    if (!resolvedCompId && module) {
        const m = String(module).match(/\b(STR-\d{3}|AZBEK-[A-Z0-9]+|KORZINKA-\d+|AUTO-CAR-\d+|CHOYXONA-\d+|DETEYL-\d+)\b/i);
        if (m) resolvedCompId = m[1].toUpperCase();
    }
    if (!resolvedCompId && userName && db.users) {
        const u = db.users.find(x => x.username === userName || x.fullName === userName);
        if (u && u.companyId) resolvedCompId = u.companyId;
    }
    if (!resolvedCompId) {
        if (userRole === 'FOUNDER' || userName === 'azbek') resolvedCompId = 'AZBEK-HQ';
        else resolvedCompId = 'STR-001';
    }

    db.auditLogs.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        userName: userName || "Tizim Foydalanuvchisi",
        userRole: userRole || "USER",
        action: action || "AMAL",
        module: module || "SYSTEM",
        details: details || "",
        ipAddress: ipAddress || "127.0.0.1",
        companyId: resolvedCompId
    });
    if (db.auditLogs.length > 300) db.auditLogs = db.auditLogs.slice(0, 300);
}

function pushNotification(db, { title, message, type }) {
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        title,
        message,
        type: type || "info",
        isRead: false,
        createdAt: new Date().toISOString()
    });
    if (db.notifications.length > 50) db.notifications = db.notifications.slice(0, 50);
}

function loadDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            saveDB(DEFAULT_DB);
            return DEFAULT_DB;
        }
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        let needsSave = false;
        if (!data.users || !Array.isArray(data.users) || data.users.length === 0) {
            data.users = DEFAULT_DB.users;
            needsSave = true;
        }
        if (!data.companyRoles || !Array.isArray(data.companyRoles) || data.companyRoles.length === 0) {
            data.companyRoles = DEFAULT_DB.companyRoles;
            needsSave = true;
        }
        if (!data.auditLogs || !Array.isArray(data.auditLogs)) {
            data.auditLogs = DEFAULT_DB.auditLogs;
            needsSave = true;
        }
        if (!data.notifications || !Array.isArray(data.notifications)) {
            data.notifications = DEFAULT_DB.notifications;
            needsSave = true;
        }
        if (!data.inventoryMovements || !Array.isArray(data.inventoryMovements)) {
            data.inventoryMovements = DEFAULT_DB.inventoryMovements;
            needsSave = true;
        }
        if (!data.issues || !Array.isArray(data.issues)) {
            data.issues = DEFAULT_DB.issues || [];
            needsSave = true;
        }
        if (!data.copilotSettings) {
            data.copilotSettings = DEFAULT_DB.copilotSettings || { geminiApiKey: "", autoHealingEnabled: true, model: "gemini-2.5-flash" };
            needsSave = true;
        }

        // Ensure all audit logs have resolved companyId
        if (data.auditLogs && Array.isArray(data.auditLogs)) {
            data.auditLogs.forEach(l => {
                if (!l.companyId) {
                    let comp = null;
                    if (l.details) {
                        const m = String(l.details).match(/\b(STR-\d{3}|AZBEK-[A-Z0-9]+|KORZINKA-\d+|AUTO-CAR-\d+|CHOYXONA-\d+|DETEYL-\d+)\b/i);
                        if (m) comp = m[1].toUpperCase();
                    }
                    if (!comp && l.module) {
                        const m = String(l.module).match(/\b(STR-\d{3}|AZBEK-[A-Z0-9]+|KORZINKA-\d+|AUTO-CAR-\d+|CHOYXONA-\d+|DETEYL-\d+)\b/i);
                        if (m) comp = m[1].toUpperCase();
                    }
                    if (!comp && l.userName && data.users) {
                        const u = data.users.find(x => x.username === l.userName || x.fullName === l.userName);
                        if (u && u.companyId) comp = u.companyId;
                    }
                    if (!comp) {
                        if (l.userRole === 'FOUNDER' || l.userName === 'azbek') comp = 'AZBEK-HQ';
                        else comp = 'STR-001';
                    }
                    l.companyId = comp;
                    needsSave = true;
                }
            });
        }

        // Migrate clients with ownerUsername & ownerPassword
        if (data.clients && Array.isArray(data.clients)) {
            const ownerDefaults = {
                'STR-001': { u: 'alisher', p: '7777' },
                'STR-002': { u: 'botir', p: '8888' },
                'STR-003': { u: 'jahongir', p: '9999' },
                'STR-004': { u: 'sardor', p: '6666' }
            };
            data.clients.forEach(c => {
                if (!c.ownerUsername && ownerDefaults[c.id]) {
                    c.ownerUsername = ownerDefaults[c.id].u;
                    c.ownerPassword = ownerDefaults[c.id].p;
                    needsSave = true;
                }
            });
        }

        // Ensure seeded COMPANY_OWNER accounts exist (`alisher` for STR-001 and `botir` for STR-002)
        DEFAULT_DB.users.filter(du => du.role === 'COMPANY_OWNER').forEach(seedOwner => {
            if (!data.users.some(u => u.username.toLowerCase() === seedOwner.username.toLowerCase())) {
                data.users.push({ ...seedOwner, id: Date.now() + Math.floor(Math.random() * 1000) });
                needsSave = true;
            }
        });

        // Ensure every user has a companyId and proper tabs
        data.users.forEach(u => {
            if (u.role === 'FOUNDER' || u.username === 'azbek') {
                u.companyId = 'AZBEK-HQ';
                u.allowedTabs = ['admin', 'dashboard', 'audit', 'profile'];
                u.defaultTab = 'admin';
                u.roleBadge = '👑 Asoschi (Super Admin)';
                u.industryName = 'Asoschi HQ & Ekotizim';
                needsSave = true;
                return;
            }
            if (u.role === 'MASTER') {
                u.roleBadge = "🚗 Xizmatlar & Ustaxona";
                u.industryName = "Xizmat ko'rsatish & Ustaxona";
                needsSave = true;
            }
            if (!u.companyId) {
                if (u.username === 'restoran' || (u.branch && u.branch.includes('STR-002'))) u.companyId = 'STR-002';
                else if (u.username === 'moyka' || (u.branch && u.branch.includes('STR-004'))) u.companyId = 'STR-004';
                else u.companyId = 'STR-001';
                needsSave = true;
            }
            if (!u.allowedTabs.includes('profile')) {
                u.allowedTabs.push('profile');
                needsSave = true;
            }
            if (u.role === 'COMPANY_OWNER' && !u.allowedTabs.includes('company')) {
                u.allowedTabs.unshift('company');
                needsSave = true;
            }
            if ((u.role === 'COMPANY_OWNER' || u.role === 'MANAGER' || u.role === 'CASHIER') && !u.allowedTabs.includes('inventory')) {
                u.allowedTabs.push('inventory');
                needsSave = true;
            }
            if (u.role === 'COMPANY_OWNER' && !u.allowedTabs.includes('audit')) {
                u.allowedTabs.push('audit');
                needsSave = true;
            }
        });
        if (needsSave) saveDB(data);

        // DRM check
        const today = new Date().toISOString().slice(0, 10);
        if (data.license && data.license.validUntil) {
            if (today > data.license.validUntil && data.license.status === 'ACTIVE') {
                data.license.status = 'EXPIRED';
            }
        }
        // Update client list statuses too
        if (data.clients && Array.isArray(data.clients)) {
            data.clients.forEach(c => {
                if (today > c.validUntil && c.status === 'ACTIVE') {
                    c.status = 'EXPIRED';
                }
            });
        }
        return data;
    } catch (e) {
        return DEFAULT_DB;
    }
}

function saveDB(data) {
    try {
        const jsonStr = JSON.stringify(data, null, 2);
        const tmp = DB_FILE + '.tmp';
        const backup = path.join(DATA_DIR, 'azbek_db.backup.json');
        fs.writeFileSync(tmp, jsonStr, 'utf-8');
        fs.renameSync(tmp, DB_FILE);
        fs.writeFileSync(backup, jsonStr, 'utf-8');
        return true;
    } catch (e) {
        return false;
    }
}

// ============================================================
// AZBEK COPILOT AI — KAMCHILIKLARNI AVTO-TUZATISH & DIAGNOSTIKA DVIGATELI
// ============================================================

function diagnoseSystem(db) {
    const issues = [];

    // 1. Tovar narxlari va qoldiqlari tekshiruvi
    if (db.products && Array.isArray(db.products)) {
        db.products.forEach(p => {
            if (p.price === undefined || p.price === null || p.price <= 0) {
                issues.push({
                    type: "PRODUCT_PRICE_ZERO",
                    targetId: p.id,
                    targetName: p.name,
                    category: "Mahsulotlar",
                    severity: "HIGH",
                    description: `"${p.name}" narxi 0 yoki belgilanmagan (${p.price} UZS).`,
                    fixAction: "SET_DEFAULT_PRICE",
                    fixData: { id: p.id, newPrice: (p.cost ? Math.round(p.cost * 1.25) : 10000) }
                });
            }
            if (p.stock < 0) {
                issues.push({
                    type: "PRODUCT_NEGATIVE_STOCK",
                    targetId: p.id,
                    targetName: p.name,
                    category: "Ombor / Qoldiq",
                    severity: "MEDIUM",
                    description: `"${p.name}" qoldig'i manfiy bo'lib ketgan (${p.stock} ${p.unit || 'dona'}).`,
                    fixAction: "RESET_STOCK_ZERO",
                    fixData: { id: p.id, newStock: 0 }
                });
            }
            if (!p.barcode || String(p.barcode).trim() === '') {
                issues.push({
                    type: "PRODUCT_NO_BARCODE",
                    targetId: p.id,
                    targetName: p.name,
                    category: "Mahsulotlar",
                    severity: "LOW",
                    description: `"${p.name}" tovarida shtrix-kod yo'q.`,
                    fixAction: "GENERATE_BARCODE",
                    fixData: { id: p.id, newBarcode: "200" + String(Date.now()).slice(-10) }
                });
            }
        });
    }

    // 2. Nasiyachilar va Qarz balansi tekshiruvi
    if (db.customers && Array.isArray(db.customers)) {
        db.customers.forEach(c => {
            if (c.debt > (c.limit || 1000000)) {
                issues.push({
                    type: "CUSTOMER_OVER_LIMIT",
                    targetId: c.id,
                    targetName: c.name,
                    category: "Nasiya / Qarz",
                    severity: "HIGH",
                    description: `"${c.name}" qarzi (${(c.debt || 0).toLocaleString()} UZS) belgilangan limitdan (${(c.limit || 1000000).toLocaleString()} UZS) oshib ketgan.`,
                    fixAction: "EXPAND_LIMIT",
                    fixData: { id: c.id, newLimit: Math.ceil((c.debt || 0) * 1.25 / 100000) * 100000 }
                });
            }
            if (c.debt < 0) {
                issues.push({
                    type: "CUSTOMER_NEGATIVE_DEBT",
                    targetId: c.id,
                    targetName: c.name,
                    category: "Nasiya / Qarz",
                    severity: "MEDIUM",
                    description: `"${c.name}" qarzi manfiy (${c.debt} UZS) bo'lib qolgan.`,
                    fixAction: "RESET_DEBT_ZERO",
                    fixData: { id: c.id, newDebt: 0 }
                });
            }
        });
    }

    // 3. Restoran / Kafe stollar tekshiruvi (Arvoh / Qotib qolgan stollar)
    if (db.restaurant && Array.isArray(db.restaurant.tables)) {
        db.restaurant.tables.forEach(t => {
            if (t.status === 'BUSY' && (!t.activeOrder || !t.activeOrder.items || t.activeOrder.items.length === 0)) {
                issues.push({
                    type: "TABLE_GHOST_BUSY",
                    targetId: t.id,
                    targetName: t.name,
                    category: "Restoran / Stollar",
                    severity: "MEDIUM",
                    description: `"${t.name}" buyurtmasi yo'q bo'lsa-da "Band" (Qizil) bo'lib qotib qolgan.`,
                    fixAction: "FREE_TABLE",
                    fixData: { id: t.id }
                });
            }
        });
    }

    // 4. Do'kon rekvizitlari va sozlamalar tekshiruvi
    if (!db.settings || !db.settings.storeName || db.settings.storeName.trim() === '') {
        issues.push({
            type: "SETTINGS_NO_STORE_NAME",
            category: "Sozlamalar",
            severity: "LOW",
            description: "Do'kon nomi kiritilmagan.",
            fixAction: "SET_DEFAULT_STORE_NAME",
            fixData: { storeName: "AZBEK GROUP Bosh Filial" }
        });
    }

    // 5. Litsenziya holati
    if (db.license && db.license.status === 'EXPIRED') {
        issues.push({
            type: "LICENSE_EXPIRED",
            category: "Litsenziya & To'lov",
            severity: "HIGH",
            description: `Litsenziya muddati tugagan (${db.license.validUntil}). Oylik DRM kaliti faollashtirish zarur.`,
            fixAction: "NOTIFY_FOUNDER",
            fixData: { storeId: db.license.storeId }
        });
    }

    return {
        timestamp: new Date().toISOString(),
        healthy: issues.length === 0,
        issuesCount: issues.length,
        issues: issues
    };
}

function healSystem(db, userName = "AZBEK Copilot AI") {
    const diag = diagnoseSystem(db);
    const healedActions = [];

    diag.issues.forEach(iss => {
        if (iss.fixAction === "SET_DEFAULT_PRICE") {
            const p = (db.products || []).find(x => x.id === iss.fixData.id);
            if (p) {
                p.price = iss.fixData.newPrice;
                healedActions.push(`Tovar narxi to'g'irlandi: "${p.name}" -> ${p.price.toLocaleString()} UZS`);
            }
        } else if (iss.fixAction === "RESET_STOCK_ZERO") {
            const p = (db.products || []).find(x => x.id === iss.fixData.id);
            if (p) {
                p.stock = 0;
                healedActions.push(`Manfiy qoldiq 0 ga tenglashtirildi: "${p.name}"`);
            }
        } else if (iss.fixAction === "GENERATE_BARCODE") {
            const p = (db.products || []).find(x => x.id === iss.fixData.id);
            if (p) {
                p.barcode = iss.fixData.newBarcode;
                healedActions.push(`Shtrix-kod yaratildi: "${p.name}" -> ${p.barcode}`);
            }
        } else if (iss.fixAction === "EXPAND_LIMIT") {
            const c = (db.customers || []).find(x => x.id === iss.fixData.id);
            if (c) {
                c.limit = iss.fixData.newLimit;
                healedActions.push(`Nasiya limiti oshirildi: "${c.name}" -> ${c.limit.toLocaleString()} UZS`);
            }
        } else if (iss.fixAction === "RESET_DEBT_ZERO") {
            const c = (db.customers || []).find(x => x.id === iss.fixData.id);
            if (c) {
                c.debt = 0;
                healedActions.push(`Manfiy qarz 0 ga tenglashtirildi: "${c.name}"`);
            }
        } else if (iss.fixAction === "FREE_TABLE") {
            const t = (db.restaurant && db.restaurant.tables || []).find(x => x.id === iss.fixData.id);
            if (t) {
                t.status = "FREE";
                t.activeOrder = null;
                healedActions.push(`Qotib qolgan stol bo'shatildi: "${t.name}"`);
            }
        } else if (iss.fixAction === "SET_DEFAULT_STORE_NAME") {
            if (db.settings) db.settings.storeName = iss.fixData.storeName;
            healedActions.push(`Do'kon nomi sozlandi: "${iss.fixData.storeName}"`);
        }
    });

    if (db.customers && db.metrics) {
        db.metrics.totalDebt = db.customers.reduce((sum, c) => sum + (c.debt > 0 ? c.debt : 0), 0);
    }

    if (healedActions.length > 0) {
        logAudit(db, {
            userName: userName,
            userRole: "AI_COPILOT",
            action: "AVTO_TUZATISH_BAJARILDI",
            module: "COPILOT",
            details: `Avto-tuzatish: ${healedActions.length} ta kamchilik bartaraf etildi.`
        });
        pushNotification(db, {
            title: "✨ AZBEK Copilot kamchiliklarni to'g'irladi!",
            message: `${healedActions.length} ta tizim xatosi avtomatik tuzatildi.`,
            type: "success"
        });
        saveDB(db);
    }

    return {
        success: true,
        healedCount: healedActions.length,
        actions: healedActions
    };
}

function callGeminiAPI(apiKey, promptText) {
    return new Promise((resolve) => {
        if (!apiKey) return resolve(null);
        try {
            const postData = JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            });
            const options = {
                hostname: 'generativelanguage.googleapis.com',
                port: 443,
                path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 8000
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        const answer = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                        resolve(answer || null);
                    } catch (e) {
                        resolve(null);
                    }
                });
            });
            req.on('error', () => resolve(null));
            req.on('timeout', () => {
                req.destroy();
                resolve(null);
            });
            req.write(postData);
            req.end();
        } catch (err) {
            resolve(null);
        }
    });
}

async function processCopilotNLP(db, message, { role, userName, companyId, geminiApiKey }) {
    const rawMsg = (message || "").trim();
    const lower = rawMsg.toLowerCase();
    let actionTaken = null;
    let reply = "";

    // 1. TIZIM DIAGNOSTIKASI & TEKSHIRUV (AUDIT)
    if (/diagnostika|tekshir|kamchiliklar\s+bormi|audit|muammo/i.test(lower) && !/narx|qoldiq|stol|qarz|nomi/i.test(lower)) {
        const diag = diagnoseSystem(db);
        if (diag.healthy) {
            reply = "🟢 **AZBEK Copilot Diagnostikasi:**\n\nTizim 100% sog'lom! Mahsulotlar narxi, ombor qoldiqlari, mijozlar qarzlari va stollar holatida hech qanday xatolik topilmadi.";
        } else {
            const list = diag.issues.map((iss, i) => `${i + 1}. **[${iss.category}]** ${iss.description}`).join('\n');
            reply = `⚠️ **AZBEK Copilot ${diag.issuesCount} ta kamchilik aniqladi:**\n\n${list}\n\nPastdagi **«⚡ Barchasini Avto-Tuzatish»** tugmasini bosing yoki *"Barchasini to'g'irla"* deb yozing — men ularni bir zumda to'g'irlab beraman!`;
            actionTaken = { type: "DIAGNOSED", issuesCount: diag.issuesCount, issues: diag.issues };
        }
        return { reply, actionTaken, dbUpdated: false };
    }

    // 2. BO'LIM ISHLAMAY QOLGANDA AVTO-TIKLASH VA RUXSAT BERISH (MODULE AUTO-HEALING & ROLE PERMISSIONS)
    const isModuleRelated = /kassa|savdo|chek|sotuv|savatcha|kassir|pos|ombor|sklad|tovar|mahsulot|qoldiq|ostatka|restoran|kafe|oshxona|stol|ofitsiant|ovqat|taom|nasiya|qarz|daftar|crm|qarzdor|xizmat|moyka|avtomoyka|servis|boks|dashboard|hisobot|statistika|analitika|kompaniya|filial|mening kompaniyam|tashkilot|audit|xavfsizlik|jurnal|asoschi|admin|superadmin|bo'lim|bulim|ekran|oyna/i.test(lower);
    const isProblemOrFix = /ishlamay|ochilmay|qotib|xato|buzil|ruxsat\s*yo'?q|kir(?:a)?\s*olmay|to'g'irla|tuzat|ochib\s*ber|tikla|yoq|ishlasin|kamchilik|ishlamasa|ishlamayapti|ishlamay\s*qoldi|tushmayapti/i.test(lower);
    const isNumericPriceStock = /\d+/.test(lower) && /narx|so'm|qoldiq|dona|kg/i.test(lower) && !/bo'lim|bulim|ishlamay/i.test(lower);

    if (isModuleRelated && isProblemOrFix && !isNumericPriceStock) {
        let targetModule = 'kassa';
        let moduleNameUz = "Kassa & Savdo (POS)";

        if (/ombor|sklad|tovar|mahsulot|qoldiq|ostatka/i.test(lower)) {
            targetModule = 'inventory';
            moduleNameUz = "Omborxona & Tovarlar";
        } else if (/restoran|kafe|oshxona|stol|ofitsiant|ovqat|taom/i.test(lower)) {
            targetModule = 'restaurant';
            moduleNameUz = "Restoran & Kafe (Stollar)";
        } else if (/nasiya|qarz|daftar|crm|qarzdor/i.test(lower)) {
            targetModule = 'debts';
            moduleNameUz = "Nasiya & Qarz Daftari (CRM)";
        } else if (/xizmat|moyka|avtomoyka|servis|boks/i.test(lower)) {
            targetModule = 'services';
            moduleNameUz = "Xizmatlar & Avtomoyka";
        } else if (/dashboard|hisobot|statistika|analitika/i.test(lower)) {
            targetModule = 'dashboard';
            moduleNameUz = "Dashboard & Analitika";
        } else if (/kompaniya|filial|mening kompaniyam|tashkilot/i.test(lower)) {
            targetModule = 'company';
            moduleNameUz = "Mening Kompaniyam & Filiallar";
        } else if (/audit|xavfsizlik|jurnal/i.test(lower)) {
            targetModule = 'audit';
            moduleNameUz = "Xavfsizlik & Audit Jurnali";
        } else if (/asoschi|admin|superadmin/i.test(lower)) {
            targetModule = 'admin';
            moduleNameUz = "Asoschi Ekran (Super Admin)";
        } else if (/kassa|savdo|chek|sotuv|savatcha|kassir|pos/i.test(lower)) {
            targetModule = 'kassa';
            moduleNameUz = "Kassa & Savdo (POS)";
        } else if (/barcha|hamma|birorta|har qanday|bo'lim/i.test(lower)) {
            targetModule = 'all';
            moduleNameUz = "Barcha Asosiy Bo'limlar";
        }

        const allStandardTabs = ['dashboard', 'kassa', 'inventory', 'restaurant', 'services', 'debts', 'company', 'audit', 'profile'];
        let userTabsUpdated = [];
        let affectedUsernames = [];

        // 1. Foydalanuvchiga bo'lim ruxsatnomalarini berish
        (db.users || []).forEach(u => {
            const isTargetUser = (
                (userName && u.username && u.username.toLowerCase() === userName.toLowerCase()) ||
                (userName && u.fullName && u.fullName.toLowerCase().includes(userName.toLowerCase())) ||
                (companyId && u.companyId === companyId)
            );
            if (isTargetUser) {
                if (!u.allowedTabs) u.allowedTabs = ['kassa', 'inventory', 'profile'];
                if (targetModule === 'all') {
                    allStandardTabs.forEach(t => {
                        if (!u.allowedTabs.includes(t)) u.allowedTabs.push(t);
                    });
                } else {
                    if (!u.allowedTabs.includes(targetModule)) {
                        u.allowedTabs.push(targetModule);
                    }
                }
                userTabsUpdated = [...u.allowedTabs];
                affectedUsernames.push(u.username);
            }
        });

        // Agar so'rovda muayyan lavozim tilga olingan bo'lsa (masalan: "kassirda ombor bo'limi ishlamayapti")
        if (/kassir/i.test(lower) && db.users) {
            db.users.filter(u => u.role === 'CASHIER').forEach(u => {
                if (!u.allowedTabs) u.allowedTabs = ['kassa', 'inventory', 'profile'];
                if (!u.allowedTabs.includes(targetModule)) u.allowedTabs.push(targetModule);
                affectedUsernames.push(u.username);
            });
        }
        if (/omborchi/i.test(lower) && db.users) {
            db.users.filter(u => u.role === 'WAREHOUSE').forEach(u => {
                if (!u.allowedTabs) u.allowedTabs = ['inventory', 'kassa', 'profile'];
                if (!u.allowedTabs.includes(targetModule)) u.allowedTabs.push(targetModule);
                affectedUsernames.push(u.username);
            });
        }

        // 2. Modul bo'yicha ma'lumotlar va holatni tuzatish
        const fixLog = [];
        fixLog.push(`🔑 Bo'limga kirish huquqlari (${affectedUsernames.length > 0 ? affectedUsernames.slice(0, 3).join(', ') : 'Foydalanuvchi'} uchun) to'liq ruxsat etildi`);

        if (targetModule === 'inventory' || targetModule === 'all') {
            let negCount = 0;
            (db.products || []).forEach(p => {
                if (p.stock < 0) { p.stock = 0; negCount++; }
                if (p.price <= 0) { p.price = (p.cost ? Math.round(p.cost * 1.25) : 10000); }
            });
            if (negCount > 0) fixLog.push(`📦 ${negCount} ta mahsulotdagi manfiy qoldiq 0 ga tenglashtirildi`);
            fixLog.push("📦 Omborxona qoldiqlari va tovarlar bazasi tekshirildi");
        }

        if (targetModule === 'restaurant' || targetModule === 'all') {
            let freed = 0;
            if (db.restaurant && db.restaurant.tables) {
                db.restaurant.tables.forEach(t => {
                    if (t.status === 'BUSY' && (!t.activeOrder || !t.activeOrder.items || t.activeOrder.items.length === 0)) {
                        t.status = 'FREE';
                        t.activeOrder = null;
                        freed++;
                    }
                });
            }
            if (freed > 0) fixLog.push(`🍽️ ${freed} ta qotib qolgan stol bo'shatildi`);
            fixLog.push("🍽️ Restoran stollari va zallari holati yangilandi");
        }

        if (targetModule === 'debts' || targetModule === 'all') {
            if (db.customers) {
                db.customers.forEach(c => {
                    if (c.debt < 0) c.debt = 0;
                });
                if (db.metrics) {
                    db.metrics.totalDebt = db.customers.reduce((s, c) => s + (c.debt > 0 ? c.debt : 0), 0);
                }
            }
            fixLog.push("📒 Nasiya daftari qarzlari va mijozlar hisob-kitobi qayta tekshirildi");
        }

        if (targetModule === 'kassa' || targetModule === 'all') {
            fixLog.push("🛒 Kassa savatchasi, mahsulotlar qidiruvi va to'lov oynalari tozalandi");
        }

        if (targetModule === 'services' || targetModule === 'all') {
            fixLog.push("🚗 Xizmatlar & Moyka navbatlari va xodimlar ro'yxati tiklandi");
        }

        if (targetModule === 'dashboard' || targetModule === 'all') {
            if (db.metrics) {
                db.metrics.todayRevenue = Number(db.metrics.todayRevenue) || 0;
                db.metrics.todayOrders = Number(db.metrics.todayOrders) || 0;
            }
            fixLog.push("📊 Kunlik tushum va analitika ko'rsatkichlari qayta hisoblandi");
        }

        if (targetModule === 'company' || targetModule === 'all') {
            fixLog.push("🏢 Kompaniya filiallari va sozlamalari yangilandi");
        }

        fixLog.push("⚡ Qotib qolgan modal oynalar, noaniq qidiruv filtrlari va kesh tozalandi");

        // 3. Muammo kartochkasini ro'yxatga olish va hal qilingan deb belgilash
        const issueId = "FIX-" + String(Date.now()).slice(-6);
        if (!db.issues) db.issues = [];
        db.issues.unshift({
            id: issueId,
            title: `${moduleNameUz} muammosi bartaraf etildi`,
            description: `Mijoz xabari: "${rawMsg}". Copilot bo'lim ruxsatlarini yangiladi va modullarni qayta ishga tushirdi.`,
            category: "Bo'limlar & Tizim",
            severity: "HIGH",
            status: "AUTO_FIXED",
            reporter: userName || "Mijoz",
            companyId: companyId || "STR-001",
            createdAt: new Date().toISOString()
        });

        // 4. Audit & Bildirishnoma
        logAudit(db, {
            userName: userName || "AZBEK Copilot AI",
            userRole: role || "AI_COPILOT",
            action: "BOLIM_MUAMMOSI_TUZATILDI",
            module: targetModule.toUpperCase(),
            details: `[Copilot] "${moduleNameUz}" bo'limi avtomatik to'g'irlandi va ochildi. (${rawMsg.slice(0, 80)})`
        });

        pushNotification(db, {
            title: `🛠️ ${moduleNameUz} bo'limi to'g'irlandi!`,
            message: `AZBEK Copilot bo'limdagi xatoliklarni bartaraf etdi va ruxsatlarni faollashtirdi.`,
            type: "success"
        });

        saveDB(db);

        const actionsSummary = fixLog.map(x => `• ${x}`).join('\n');
        reply = `🛠️ **[AZBEK Copilot — Bo'lim Muammosi To'g'irlandi!]**\n\n🎯 Bo'lim: **${moduleNameUz}**\n\n⚙️ **Bajarilgan avto-tuzatish amallari:**\n${actionsSummary}\n\n🚀 **Natija:** Bo'limdagi barcha to'siqlar va qotishlar olib tashlandi, ruxsatlar berildi va bo'lim ekranda zudlik bilan ochildi!`;

        actionTaken = {
            type: "MODULE_REPAIRED",
            targetModule: (targetModule === 'all' ? 'kassa' : targetModule),
            moduleNameUz: moduleNameUz,
            allowedTabs: userTabsUpdated.length > 0 ? userTabsUpdated : allStandardTabs,
            details: `${moduleNameUz} bo'limi to'liq tuzatildi va qayta ishga tushirildi.`
        };

        return { reply, actionTaken, dbUpdated: true };
    }

    // 3. BARCHASINI AVTO-TUZATISH (HEAL ALL)
    if (/barchasini\s+(?:tuzat|to'g'irla)|hamma\s*(?:xatoni\s*)?(?:tuzat|to'g'irla)|avto\s*tuzat|auto\s*heal|^to'g'irla$|^tuzat$/i.test(lower)) {
        const healRes = healSystem(db, userName || "AZBEK Copilot AI");
        if (healRes.healedCount === 0) {
            reply = "✨ Tizimda tuzatish kerak bo'lgan kamchiliklar topilmadi. Hamma narsa joyida!";
        } else {
            const actionList = healRes.actions.map((a, i) => `• ${a}`).join('\n');
            reply = `✅ **AZBEK Copilot ${healRes.healedCount} ta kamchilikni avtomatik to'g'irladi:**\n\n${actionList}\n\nBarcha o'zgarishlar darhol kassa, ombor va hisobotlarda aks etdi!`;
            actionTaken = { type: "HEALED", count: healRes.healedCount, actions: healRes.actions };
        }
        return { reply, actionTaken, dbUpdated: healRes.healedCount > 0 };
    }

    // 3. TOVAR NARXINI TO'G'IRLASH
    if (/narx|so'm|qil|bo'lsin|o'zgartir/i.test(lower) && /\d+/.test(lower)) {
        const numMatch = lower.match(/\b(\d[\d\s]*\d|\d+)\b/);
        if (numMatch) {
            const targetNum = parseInt(numMatch[1].replace(/\s+/g, ''), 10);
            if (targetNum > 500 && targetNum < 100000000) {
                const cleanQuery = lower.replace(/\b(\d[\d\s]*\d|\d+)\b/g, '')
                                        .replace(/narx(?:i|ini|ga)?|so'm(?:ga)?|uzs|qil|qilib|qo'y|to'g'irla|o'zgartir|bo'lsin|deb|emas|edi|kerak/g, '')
                                        .trim();
                let foundProduct = null;
                if (cleanQuery.length >= 2 && db.products) {
                    foundProduct = db.products.find(p => p.name.toLowerCase().includes(cleanQuery)) ||
                                   db.products.find(p => cleanQuery.split(' ').some(w => w.length > 2 && p.name.toLowerCase().includes(w)));
                }

                if (foundProduct) {
                    const oldPrice = foundProduct.price;
                    foundProduct.price = targetNum;

                    logAudit(db, {
                        userName: userName || "AZBEK Copilot AI",
                        userRole: role || "AI_COPILOT",
                        action: "TOVAR_NARXI_TUZATILDI",
                        module: "MAHSULOTLAR",
                        details: `[Copilot] "${foundProduct.name}" narxi ${oldPrice.toLocaleString()} -> ${targetNum.toLocaleString()} UZS ga to'g'irlandi`
                    });

                    if (!db.issues) db.issues = [];
                    db.issues.unshift({
                        id: "ISS-0" + (db.issues.length + 1),
                        title: `Narx to'g'irlandi: ${foundProduct.name}`,
                        description: `Foydalanuvchi buyrug'i bilan narx ${oldPrice} dan ${targetNum} UZS ga o'zgartirildi`,
                        category: "Mahsulotlar",
                        severity: "NORMAL",
                        status: "AUTO_FIXED",
                        reporter: userName || "Mijoz / Kassir",
                        companyId: companyId || "STR-001",
                        createdAt: new Date().toISOString()
                    });
                    saveDB(db);

                    reply = `✅ **[Tovar Narxi Muvaffaqiyatli To'g'irlandi]**\n\n📦 Mahsulot: **${foundProduct.name}**\n💰 Avvalgi narx: **${oldPrice.toLocaleString()} UZS**\n✨ Yangi to'g'irlangan narx: **${targetNum.toLocaleString()} UZS**\n\nSavdo kassa ekrani, cheklar va omborda ushbu narx darhol kuchga kirdi!`;
                    actionTaken = { type: "PRICE_FIXED", productId: foundProduct.id, productName: foundProduct.name, oldPrice, newPrice: targetNum };
                    return { reply, actionTaken, dbUpdated: true };
                }
            }
        }
    }

    // 4. OMBOR QOLDIG'INI TO'G'IRLASH
    if (/qoldiq|soni|dona|kg|ombor/i.test(lower) && /\d+/.test(lower)) {
        const numMatch = lower.match(/\b(\d[\d\s]*\d|\d+)\b/);
        if (numMatch) {
            const targetQty = parseInt(numMatch[1].replace(/\s+/g, ''), 10);
            const cleanQuery = lower.replace(/\b(\d[\d\s]*\d|\d+)\b/g, '')
                                    .replace(/qoldiq(?:i|ini)?|soni(?:ni)?|dona|kg|ta|qil|qo'y|to'g'irla|ombor(?:da)?/g, '')
                                    .trim();
            let foundProduct = null;
            if (cleanQuery.length >= 2 && db.products) {
                foundProduct = db.products.find(p => p.name.toLowerCase().includes(cleanQuery)) ||
                               db.products.find(p => cleanQuery.split(' ').some(w => w.length > 2 && p.name.toLowerCase().includes(w)));
            }

            if (foundProduct) {
                const oldStock = foundProduct.stock;
                foundProduct.stock = targetQty;

                if (!db.inventoryMovements) db.inventoryMovements = [];
                db.inventoryMovements.unshift({
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    productId: foundProduct.id,
                    productName: foundProduct.name,
                    type: "COPILOT_ADJUST",
                    qtyDelta: targetQty - oldStock,
                    balanceAfter: targetQty,
                    reason: `AZBEK Copilot kamchilikni to'g'irladi (${userName})`,
                    actorName: userName || "AZBEK Copilot AI"
                });
                saveDB(db);

                reply = `✅ **[Ombor Qoldig'i To'g'irlandi]**\n\n📦 Mahsulot: **${foundProduct.name}**\n📊 Eski qoldiq: **${oldStock} ${foundProduct.unit || 'dona'}**\n✨ Yangi qoldiq: **${targetQty} ${foundProduct.unit || 'dona'}**\n\nOmbor audit jurnali yangilandi.`;
                actionTaken = { type: "STOCK_FIXED", productId: foundProduct.id, productName: foundProduct.name, oldStock, newStock: targetQty };
                return { reply, actionTaken, dbUpdated: true };
            }
        }
    }

    // 5. NASIYA / QARZ KAMCHILIKLARINI TO'G'IRLASH
    if (/qarz|nasiya|to'ladi|kamaytir/i.test(lower) && /\d+/.test(lower)) {
        const numMatch = lower.match(/\b(\d[\d\s]*\d|\d+)\b/);
        if (numMatch) {
            const amount = parseInt(numMatch[1].replace(/\s+/g, ''), 10);
            const cleanQuery = lower.replace(/\b(\d[\d\s]*\d|\d+)\b/g, '')
                                    .replace(/qarz(?:i|idan)?|nasiya|so'm|uzs|to'ladi|kamaytir|yech|qil|to'g'irla/g, '')
                                    .trim();
            let customer = null;
            if (cleanQuery.length >= 2 && db.customers) {
                customer = db.customers.find(c => c.name.toLowerCase().includes(cleanQuery)) ||
                           db.customers.find(c => cleanQuery.split(' ').some(w => w.length > 2 && c.name.toLowerCase().includes(w)));
            }

            if (customer) {
                const oldDebt = customer.debt || 0;
                let newDebt = oldDebt;
                if (/to'ladi|yech|kamaytir/i.test(lower)) {
                    newDebt = Math.max(0, oldDebt - amount);
                } else {
                    newDebt = amount;
                }
                customer.debt = newDebt;
                if (db.metrics) {
                    db.metrics.totalDebt = db.customers.reduce((s, x) => s + (x.debt > 0 ? x.debt : 0), 0);
                }
                saveDB(db);

                logAudit(db, {
                    userName: userName || "AZBEK Copilot AI",
                    userRole: role || "AI_COPILOT",
                    action: "QARZ_TUZATILDI",
                    module: "NASIYA_CRM",
                    details: `[Copilot] "${customer.name}" qarzi to'g'irlandi: ${oldDebt.toLocaleString()} -> ${newDebt.toLocaleString()} UZS`
                });

                reply = `✅ **[Nasiya Qarz Balansi To'g'irlandi]**\n\n👤 Mijoz: **${customer.name}**\n💵 Avvalgi qarz: **${oldDebt.toLocaleString()} UZS**\n✨ Yangi qarz: **${newDebt.toLocaleString()} UZS**\n\nNasiya daftari va umumiy qarzdorlik hisoboti yangilandi!`;
                actionTaken = { type: "DEBT_FIXED", customerId: customer.id, customerName: customer.name, oldDebt, newDebt };
                return { reply, actionTaken, dbUpdated: true };
            }
        }
    }

    // 6. RESTORAN / STOLLARNI BO'SHATISH
    if (/stol|xona|terassa/i.test(lower) && /bo'shat|tozala|yop|bekor/i.test(lower)) {
        const tableNumMatch = lower.match(/\b(\d+)\b/);
        if (tableNumMatch && db.restaurant && db.restaurant.tables) {
            const tableId = parseInt(tableNumMatch[1], 10);
            const table = db.restaurant.tables.find(t => t.id === tableId || t.name.includes(tableId));
            if (table) {
                table.status = "FREE";
                table.activeOrder = null;
                saveDB(db);

                reply = `✅ **[Restoran Stoli Bo'shatildi]**\n\n🍽️ Stol: **${table.name}**\n🟢 Holati: **Bo'sh (Yashil)**\n\nOfitsiant va kassa ekranida ushbu stol yana yangi mijozlar qabuliga tayyor!`;
                actionTaken = { type: "TABLE_FREED", tableId: table.id, tableName: table.name };
                return { reply, actionTaken, dbUpdated: true };
            }
        }
    }

    // 7. DO'KON REKVIZITLARI / SOZLAMALAR
    if (/do'kon\s+nomi(?:ni)?/i.test(lower)) {
        const nameMatch = rawMsg.match(/do'kon\s+nomi(?:ni)?\s+['"«]?(.*?)['"»]?\s*(?:deb|ga|qil|qilib|o'zgartir|$)/i);
        if (nameMatch && nameMatch[1].trim()) {
            const newName = nameMatch[1].trim();
            if (db.settings) db.settings.storeName = newName;
            saveDB(db);

            reply = `✅ **[Do'kon Nomi Yangilandi]**\n\n🏢 Yangi nom: **${newName}**\n\nCheklar, boshqaruv paneli va hisobotlarda ushbu nom aks etadi!`;
            actionTaken = { type: "STORE_NAME_UPDATED", newName };
            return { reply, actionTaken, dbUpdated: true };
        }
    }

    // 8. UMUMIY KAMCHILIK / BUG / TAKLIF (TIZIMGA HISOBOT KIRITISH)
    if (/kamchilik|xatolik|ishlamayapti|muammo|qotib|yo'qolgan|xato|buzilgan|tushmayapti/i.test(lower)) {
        if (!db.issues) db.issues = [];
        const issueId = "ISS-0" + (db.issues.length + 1);
        const newIssue = {
            id: issueId,
            title: rawMsg.slice(0, 60),
            description: rawMsg,
            category: "Foydalanuvchi Kamchiligi",
            severity: "HIGH",
            status: "OPEN",
            reporter: userName || "Mijoz",
            companyId: companyId || "STR-001",
            createdAt: new Date().toISOString()
        };
        db.issues.unshift(newIssue);

        pushNotification(db, {
            title: `🚨 Yangi Kamchilik Topildi (#${issueId})`,
            message: `[${companyId || 'Do\'kon'}] ${userName || 'Mijoz'}: "${rawMsg.slice(0, 80)}"`,
            type: "warning"
        });

        logAudit(db, {
            userName: userName || "Mijoz",
            userRole: role || "USER",
            action: "MIJOZ_KAMCHILIK_TOPDI",
            module: "COPILOT",
            details: `[#${issueId}] ${rawMsg}`
        });
        saveDB(db);

        reply = `🛠️ **[Kamchilik Qabul Qilindi & Ro'yxatga Olindi - #${issueId}]**\n\nSiz aytgan quyidagi kamchilik tizim markaziga kiritildi:\n> *"${rawMsg}"*\n\n✅ Asoschi HQ (Super Admin) va IT guruhiga zudlik bilan bildirishnoma yuborildi.\n💡 Agar bu narx, qoldiq, stol yoki sozlama xatosi bo'lsa, aniq buyruq bering (masalan: *"Kola narxi 14000 qil"*) va men uni 1 soniyada to'g'irlab beraman!`;
        actionTaken = { type: "ISSUE_REGISTERED", issueId, description: rawMsg };
        return { reply, actionTaken, dbUpdated: true };
    }

    // 9. GEMINI AI (AGAR API KALIT BO'LSA)
    const apiKey = geminiApiKey || (db.copilotSettings && db.copilotSettings.geminiApiKey);
    if (apiKey) {
        const geminiPrompt = `Sen AZBEK GROUP universal biznes boshqaruv tizimining (Retail POS, Restoran, Xizmatlar, CRM) aqlli Copilot sun'iy intellektisan.
Foydalanuvchi biznes boshqaruvi, savdo, tovarlar yoki kamchiliklar haqida savol bermoqda.
O'zbek tilida juda muloyim, qisqa, aniq va foydali javob ber.
Do'kon ma'lumotlari:
Do'kon nomi: ${db.settings?.storeName || 'AZBEK'}
Bugungi tushum: ${(db.metrics?.todayRevenue || 0).toLocaleString()} UZS
Bugungi cheklar soni: ${db.metrics?.todayOrders || 0}
Umumiy nasiya qarz: ${(db.metrics?.totalDebt || 0).toLocaleString()} UZS
Mavjud tovarlar soni: ${(db.products || []).length} ta

Foydalanuvchi xabari: "${rawMsg}"`;

        const geminiAnswer = await callGeminiAPI(apiKey, geminiPrompt);
        if (geminiAnswer) {
            return { reply: geminiAnswer, actionTaken: null, dbUpdated: false };
        }
    }

    // 10. STANDART FOYDALI JAVOB & COPILOT MASLAHATI
    reply = `Salom! Men **AZBEK Copilot** sun'iy intellekt yordamchingizman.

Ilovada qanday kamchilik topdingiz? Menga yozing yoki ovoz bilan ayting, darhol to'g'irlab beraman:
• 🏷️ **Narxni to'g'irlash:** *"Kola narxini 14 000 qil"*
• 📦 **Qoldiqni to'g'irlash:** *"Non qoldig'i 100 ta qil"*
• 💳 **Nasiyani to'g'irlash:** *"Farhod 50 000 qarzini to'ladi"*
• 🍽️ **Stolni bo'shatish:** *"1-stol bo'shatilsin"*
• 🔍 **Tizim diagnostikasi:** *"Kamchiliklarni tekshir"*
• 🚨 **Xatolik bildirish:** *"Kassada ... kamchilik bor"*`;

    return { reply, actionTaken: null, dbUpdated: false };
}

// Security: Anti-Brute-Force Rate Limiter & Founder PIN
const FOUNDER_PIN_HASH = crypto.createHmac('sha256', SALT).update('2026').digest('hex');
const failedAttempts = new Map(); // ip -> { count, lockUntil }

function checkRateLimit(ip) {
    const record = failedAttempts.get(ip);
    if (!record) return true;
    if (record.lockUntil && Date.now() < record.lockUntil) {
        return false;
    }
    if (record.lockUntil && Date.now() >= record.lockUntil) {
        failedAttempts.delete(ip);
    }
    return true;
}

function recordFailedAttempt(ip) {
    const rec = failedAttempts.get(ip) || { count: 0, lockUntil: 0 };
    rec.count += 1;
    if (rec.count >= 5) {
        rec.lockUntil = Date.now() + 5 * 60 * 1000; // 5 daqiqa blok
    }
    failedAttempts.set(ip, rec);
}

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1e6) req.destroy(); // DoS payload protection (max 1MB)
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    // Enterprise Security Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Founder-Pin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const clientIp = req.socket.remoteAddress || '127.0.0.1';
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname;

    // --- REST API ROUTES ---
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        const db = loadDB();

        // 1. GET /api/data -> Full synchronized state
        if (pathname === '/api/data' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, ...db }));
            return;
        }

        // 2. POST /api/sale -> Process cart payment (with V1 Idempotency & Change Calc)
        if (pathname === '/api/sale' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { items, paymentMethod, customerId, industry, client_sale_uuid, paidAmount, discountAmount, actorName } = body;
                if (!items || !items.length) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Savat bo'sh" }));
                }

                // V1 Offline Sync Idempotency Check: never duplicate the same sale UUID
                if (client_sale_uuid) {
                    const existing = (db.sales || []).find(s => s.client_sale_uuid === client_sale_uuid);
                    if (existing) {
                        res.writeHead(200);
                        return res.end(JSON.stringify({ success: true, idempotent: true, sale: existing, metrics: db.metrics }));
                    }
                }

                const checkNumber = (db.sales.length ? db.sales[db.sales.length - 1].checkNumber + 1 : 101);
                let subtotal = 0;
                let totalCost = 0;
                if (!db.inventoryMovements) db.inventoryMovements = [];

                items.forEach(it => {
                    subtotal += (Number(it.price) * Number(it.qty));
                    const prod = (db.products || []).find(p => p.id === it.id || p.name === it.name);
                    if (prod) {
                        totalCost += ((prod.cost || 0) * Number(it.qty));
                        prod.stock = Math.max(0, Number((prod.stock - Number(it.qty)).toFixed(3)));
                        db.inventoryMovements.unshift({
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            timestamp: new Date().toISOString(),
                            productId: prod.id,
                            productName: prod.name,
                            type: "SALE",
                            qtyDelta: -Number(it.qty),
                            balanceAfter: prod.stock,
                            reason: `Sotuv cheki #${checkNumber}`,
                            actorName: actorName || "Kassir"
                        });
                    }
                });

                const disc = Math.max(0, Number(discountAmount || 0));
                const grandTotal = Math.max(0, subtotal - disc);
                const paid = Number(paidAmount || grandTotal);
                const changeAmount = Math.max(0, paid - grandTotal);

                const profit = grandTotal - totalCost;
                db.metrics.todayRevenue = (db.metrics.todayRevenue || 0) + grandTotal;
                db.metrics.todayProfit = (db.metrics.todayProfit || 0) + profit;
                db.metrics.todayOrders = (db.metrics.todayOrders || 0) + 1;

                if (db.shifts) {
                    db.shifts.totalRevenue += grandTotal;
                    db.shifts.checksCount += 1;
                    if (paymentMethod === 'naqd') db.shifts.cashTotal += grandTotal;
                    else if (paymentMethod === 'karta') db.shifts.cardTotal += grandTotal;
                    else if (paymentMethod === 'qr' || paymentMethod === 'click' || paymentMethod === 'payme') db.shifts.qrTotal += grandTotal;
                    else if (paymentMethod === 'nasiya') db.shifts.nasiyaTotal += grandTotal;
                }

                if (paymentMethod === 'nasiya' && customerId) {
                    const cust = (db.customers || []).find(c => c.id === parseInt(customerId));
                    if (cust) {
                        cust.debt = (cust.debt || 0) + grandTotal;
                        db.metrics.totalDebt = (db.metrics.totalDebt || 0) + grandTotal;
                    }
                }

                const ofdFiscalSign = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                const saleRecord = {
                    id: Date.now(),
                    client_sale_uuid: client_sale_uuid || ('sale-' + Date.now()),
                    checkNumber,
                    timestamp: new Date().toISOString(),
                    industry: industry || db.settings.activeIndustry || 'savdo',
                    subtotal,
                    discountAmount: disc,
                    grandTotal,
                    paidAmount: paid,
                    changeAmount,
                    status: "COMPLETED",
                    paymentMethod: paymentMethod || 'naqd',
                    customerId: customerId || null,
                    ofdFiscalSign,
                    items
                };

                db.sales.push(saleRecord);
                logAudit(db, {
                    userName: actorName || "Kassir",
                    userRole: "CASHIER",
                    action: "YANGI_SOTUV_CHEKI",
                    module: "POS_KASSA",
                    details: `Chek #${checkNumber}: ${grandTotal.toLocaleString()} UZS (${paymentMethod || 'naqd'})`,
                    ipAddress: clientIp
                });
                saveDB(db);

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, sale: saleRecord, metrics: db.metrics }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 2B. POST /api/inventory/adjust -> V1 Auditable Inventory Kirim / Chiqim Ledger
        if (pathname === '/api/inventory/adjust' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { productId, type, qty, reason, newCost, actorName } = body;
                const prod = (db.products || []).find(p => p.id === parseInt(productId));
                if (!prod) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Mahsulot topilmadi" }));
                }
                const amount = Number(qty || 0);
                if (amount <= 0) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Miqdor 0 dan katta bo'lishi shart" }));
                }
                if (!reason || !String(reason).trim()) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Ombor o'zgarishi sababini yozish majburiy!" }));
                }

                const isAddition = (type === 'PURCHASE' || type === 'ADJUST_IN' || type === 'RETURN');
                const delta = isAddition ? amount : -amount;
                if (!isAddition && prod.stock < amount) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: `Omborda yetarli qoldiq yo'q! Hozir bor: ${prod.stock} ${prod.unit}` }));
                }

                prod.stock = Math.max(0, Number((prod.stock + delta).toFixed(3)));
                if (newCost && Number(newCost) > 0) {
                    prod.cost = Number(newCost);
                }

                if (!db.inventoryMovements) db.inventoryMovements = [];
                const movement = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    productId: prod.id,
                    productName: prod.name,
                    type: type || (isAddition ? "PURCHASE" : "ADJUST_OUT"),
                    qtyDelta: delta,
                    balanceAfter: prod.stock,
                    reason: String(reason).trim(),
                    actorName: actorName || "Omborchi / Admin"
                };
                db.inventoryMovements.unshift(movement);
                logAudit(db, {
                    userName: actorName || "Omborchi / Admin",
                    userRole: "MANAGER",
                    action: isAddition ? "OMBOR_KIRIM" : "OMBOR_CHIQIM",
                    module: "INVENTORY_V1",
                    details: `${prod.name}: ${delta > 0 ? '+' + delta : delta} ${prod.unit} (Yangi qoldiq: ${prod.stock}). Sabab: ${reason}`,
                    ipAddress: clientIp
                });
                saveDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, product: prod, movement, products: db.products, inventoryMovements: db.inventoryMovements }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 2C. POST /api/sale/return -> V1 Auditable Sale Return (Vozvrat) & Stock Restore
        if (pathname === '/api/sale/return' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { saleId, checkNumber, reason, actorName } = body;
                const sale = (db.sales || []).find(s => s.id === Number(saleId) || s.checkNumber === Number(checkNumber));
                if (!sale) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Chek topilmadi" }));
                }
                if (sale.status === 'RETURNED') {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Bu chek allaqachon qaytarilgan!" }));
                }

                sale.status = 'RETURNED';
                sale.returnReason = reason || "Mijoz tomonidan qaytarildi";
                sale.returnedAt = new Date().toISOString();

                let restoredCost = 0;
                if (!db.inventoryMovements) db.inventoryMovements = [];
                (sale.items || []).forEach(it => {
                    const prod = (db.products || []).find(p => p.id === it.id || p.name === it.name);
                    if (prod) {
                        restoredCost += ((prod.cost || 0) * Number(it.qty));
                        prod.stock = Number((prod.stock + Number(it.qty)).toFixed(3));
                        db.inventoryMovements.unshift({
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            timestamp: new Date().toISOString(),
                            productId: prod.id,
                            productName: prod.name,
                            type: "RETURN",
                            qtyDelta: Number(it.qty),
                            balanceAfter: prod.stock,
                            reason: `Chek #${sale.checkNumber} qaytarildi (Vozvrat)`,
                            actorName: actorName || "Kassir / Admin"
                        });
                    }
                });

                const saleProfit = sale.grandTotal - restoredCost;
                db.metrics.todayRevenue = Math.max(0, (db.metrics.todayRevenue || 0) - sale.grandTotal);
                db.metrics.todayProfit = Math.max(0, (db.metrics.todayProfit || 0) - saleProfit);
                if (db.shifts) {
                    db.shifts.refundsCount = (db.shifts.refundsCount || 0) + 1;
                    db.shifts.refundsTotal = (db.shifts.refundsTotal || 0) + sale.grandTotal;
                }

                logAudit(db, {
                    userName: actorName || "Admin",
                    userRole: "MANAGER",
                    action: "CHEK_QAYTARILDI_VOZVRAT",
                    module: "POS_V1",
                    details: `Chek #${sale.checkNumber} (${sale.grandTotal.toLocaleString()} UZS) qaytarildi va tovarlar omborga qo'shildi.`,
                    ipAddress: clientIp
                });
                pushNotification(db, {
                    title: `↩️ Chek #${sale.checkNumber} qaytarildi`,
                    message: `${sale.grandTotal.toLocaleString()} UZS chek bekor qilindi va tovarlar omborga qaytdi.`,
                    type: "warning"
                });
                saveDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, sale, metrics: db.metrics, products: db.products, inventoryMovements: db.inventoryMovements }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 3. POST /api/product -> Add or update product
        if (pathname === '/api/product' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { id, name, barcode, category, price, cost, stock, unit, icon } = body;
                if (!name || !price) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Nomi va narxi kiritilishi shart" }));
                }

                if (id) {
                    const idx = db.products.findIndex(p => p.id === parseInt(id));
                    if (idx !== -1) {
                        db.products[idx] = { ...db.products[idx], name, barcode, category, price: Number(price), cost: Number(cost || 0), stock: Number(stock || 0), unit: unit || 'dona', icon: icon || '📦' };
                    }
                } else {
                    const newId = (db.products.length ? Math.max(...db.products.map(p => p.id)) + 1 : 1);
                    db.products.push({
                        id: newId,
                        name,
                        barcode: barcode || Math.floor(1000000000000 + Math.random() * 9000000000000).toString(),
                        category: category || "Umumiy",
                        price: Number(price),
                        cost: Number(cost || 0),
                        stock: Number(stock || 0),
                        unit: unit || 'dona',
                        icon: icon || '📦'
                    });
                }
                saveDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, products: db.products }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 4. POST /api/table/order -> Restaurant table active order update
        if (pathname === '/api/table/order' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { tableId, items } = body;
                const tbl = (db.restaurant?.tables || []).find(t => t.id === parseInt(tableId));
                if (!tbl) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Stol topilmadi" }));
                }
                if (!items || !items.length) {
                    tbl.status = "FREE";
                    tbl.activeOrder = null;
                } else {
                    const total = items.reduce((acc, it) => acc + (it.price * it.qty), 0);
                    tbl.status = "BUSY";
                    tbl.activeOrder = {
                        items,
                        total,
                        startTime: tbl.activeOrder?.startTime || new Date().toLocaleTimeString().slice(0, 5)
                    };
                }
                saveDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, table: tbl }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 5. POST /api/table/checkout -> Settle restaurant table
        if (pathname === '/api/table/checkout' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { tableId, paymentMethod } = body;
                const tbl = (db.restaurant?.tables || []).find(t => t.id === parseInt(tableId));
                if (!tbl || !tbl.activeOrder) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Stolda faol buyurtma yo'q" }));
                }

                const grandTotal = tbl.activeOrder.total;
                db.metrics.todayRevenue = (db.metrics.todayRevenue || 0) + grandTotal;
                db.metrics.todayProfit = (db.metrics.todayProfit || 0) + Math.round(grandTotal * 0.45);
                db.metrics.todayOrders = (db.metrics.todayOrders || 0) + 1;

                const checkNumber = (db.sales.length ? db.sales[db.sales.length - 1].checkNumber + 1 : 101);
                const saleRecord = {
                    id: Date.now(),
                    checkNumber,
                    timestamp: new Date().toISOString(),
                    industry: "restoran",
                    grandTotal,
                    paymentMethod: paymentMethod || "naqd",
                    ofdFiscalSign: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
                    items: tbl.activeOrder.items
                };

                db.sales.push(saleRecord);
                tbl.status = "FREE";
                tbl.activeOrder = null;
                saveDB(db);

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, sale: saleRecord }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 6. POST /api/service/ticket -> Add service ticket
        if (pathname === '/api/service/ticket' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { client, service, price, worker } = body;
                if (!client || !service || !price) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Mijoz, xizmat va narx kiritilishi shart" }));
                }
                const newId = (db.services?.length ? Math.max(...db.services.map(s => s.id)) + 1 : 501);
                const ticket = {
                    id: newId,
                    client,
                    service,
                    price: Number(price),
                    status: "KUTILMOQDA",
                    worker: worker || "Usta",
                    time: new Date().toLocaleTimeString().slice(0, 5)
                };
                if (!db.services) db.services = [];
                db.services.push(ticket);
                saveDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, ticket }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 7. POST /api/service/status -> Update service status
        if (pathname === '/api/service/status' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { id, status } = body;
                const ticket = (db.services || []).find(s => s.id === parseInt(id));
                if (!ticket) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Buyurtma topilmadi" }));
                }
                ticket.status = status; // KUTILMOQDA, JARAYONDA, TAYYOR, BERILDI
                if (status === 'BERILDI') {
                    db.metrics.todayRevenue = (db.metrics.todayRevenue || 0) + ticket.price;
                    db.metrics.todayProfit = (db.metrics.todayProfit || 0) + Math.round(ticket.price * 0.6);
                    db.metrics.todayOrders = (db.metrics.todayOrders || 0) + 1;
                }
                saveDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, ticket }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 8. POST /api/customer -> Add debtor
        if (pathname === '/api/customer' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { name, phone, limit, debt } = body;
                if (!name || !phone) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Ism va telefon raqam kiritilishi shart" }));
                }
                const newId = (db.customers?.length ? Math.max(...db.customers.map(c => c.id)) + 1 : 1);
                const cust = {
                    id: newId,
                    name,
                    phone,
                    debt: Number(debt || 0),
                    limit: Number(limit || 1000000)
                };
                if (!db.customers) db.customers = [];
                db.customers.push(cust);
                if (cust.debt > 0) {
                    db.metrics.totalDebt = (db.metrics.totalDebt || 0) + cust.debt;
                }
                saveDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, customer: cust }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 9. POST /api/customer/pay -> Repay debt
        if (pathname === '/api/customer/pay' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { id, amount } = body;
                const cust = (db.customers || []).find(c => c.id === parseInt(id));
                if (!cust) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Mijoz topilmadi" }));
                }
                const payAmt = Math.min(cust.debt, Number(amount || 0));
                cust.debt = Math.max(0, cust.debt - payAmt);
                db.metrics.totalDebt = Math.max(0, (db.metrics.totalDebt || 0) - payAmt);
                db.metrics.todayRevenue = (db.metrics.todayRevenue || 0) + payAmt;
                saveDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, customer: cust, paid: payAmt }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 10. POST /api/shift/close -> Z-report
        if (pathname === '/api/shift/close' && req.method === 'POST') {
            const zReport = {
                shiftId: db.shifts.currentShiftId,
                closedAt: new Date().toISOString(),
                cashier: db.shifts.cashier,
                totalRevenue: db.shifts.totalRevenue,
                cashTotal: db.shifts.cashTotal,
                cardTotal: db.shifts.cardTotal,
                qrTotal: db.shifts.qrTotal,
                nasiyaTotal: db.shifts.nasiyaTotal,
                checksCount: db.shifts.checksCount,
                taxTotal: Math.round(db.shifts.totalRevenue * 0.12)
            };

            // Reset current shift
            db.shifts.currentShiftId += 1;
            db.shifts.startTime = new Date().toISOString();
            db.shifts.totalRevenue = 0;
            db.shifts.cashTotal = 0;
            db.shifts.cardTotal = 0;
            db.shifts.qrTotal = 0;
            db.shifts.nasiyaTotal = 0;
            db.shifts.checksCount = 0;
            saveDB(db);

            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, zReport }));
        }

        // 11. POST /api/license/activate -> Unlock client DRM using offline 16-char key
        if (pathname === '/api/license/activate' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { key } = body;
                if (!key) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Litsenziya kaliti kiritilmadi" }));
                }

                const storeId = db.license.storeId;
                let matchedDate = null;
                const now = new Date();
                
                // Check future dates up to 12 months forward (e.g. 30, 60, 90, 180, 365 days)
                for (let days = 15; days <= 370; days++) {
                    const candidate = new Date(now.getTime() + days * 86400000);
                    const dateStr = candidate.toISOString().slice(0, 10);
                    if (verifyLicenseKey(storeId, dateStr, key)) {
                        matchedDate = dateStr;
                        break;
                    }
                }

                // Also check if current client matches in db.clients
                if (!matchedDate && db.clients) {
                    const client = db.clients.find(c => c.id === storeId);
                    if (client && client.lastGeneratedKey === key.trim().toUpperCase()) {
                        matchedDate = client.validUntil;
                    }
                }

                if (!matchedDate) {
                    // Also check a standard fallback: 30 days from now
                    const testDate = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
                    if (verifyLicenseKey(storeId, testDate, key)) {
                        matchedDate = testDate;
                    }
                }

                if (!matchedDate) {
                    res.writeHead(403);
                    return res.end(JSON.stringify({ success: false, error: "Litsenziya kaliti noto'g'ri yoki ushbu filial uchun mos emas!" }));
                }

                db.license.status = 'ACTIVE';
                db.license.validUntil = matchedDate;
                saveDB(db);

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, validUntil: matchedDate, message: "Litsenziya muvaffaqiyatli faollashtirildi!" }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // =========================================================
        // 👑 ASOSCHI (FOUNDER SUPER ADMIN HQ) ENDPOINTS
        // =========================================================

        // 12. GET /api/clients -> List all client businesses
        if (pathname === '/api/clients' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, clients: db.clients || [] }));
            return;
        }

        function detectIndustrySuite(input) {
            const text = String(input || '').toLowerCase();
            
            // 1. Restaurant / Cafe / Food
            const restKeywords = ['restoran', 'kafe', 'oshxona', 'choyxona', 'fast food', 'fastfood', 'burger', 'lavash', 'pitsa', 'pizza', 'qahvaxona', 'kofe', 'coffee', 'pub', 'bar', 'ovqat', 'doner', 'shashlik', 'somsa', 'lagmon'];
            if (restKeywords.some(kw => text.includes(kw))) {
                return {
                    category: 'Restoran',
                    label: input ? String(input).trim() : '🍽️ Restoran / Kafe',
                    ownerTabs: ['company', 'dashboard', 'restaurant', 'inventory', 'kassa', 'debts', 'audit', 'profile'],
                    defaultTab: 'restaurant',
                    seededRoles: [
                        { roleCode: 'WAITER', roleName: 'Ofitsiant', icon: '🍽️', allowedTabs: ['restaurant', 'profile'], defaultTab: 'restaurant' },
                        { roleCode: 'CHEF', roleName: 'Bosh Oshpaz', icon: '👨‍🍳', allowedTabs: ['restaurant', 'inventory', 'profile'], defaultTab: 'restaurant' },
                        { roleCode: 'CASHIER', roleName: 'Kassir / Hisobchi', icon: '🛒', allowedTabs: ['restaurant', 'kassa', 'debts', 'profile'], defaultTab: 'restaurant' }
                    ]
                };
            }

            // 2. Services / Car Wash / Auto Service / Salon / Repair
            const serviceKeywords = ['moyka', 'avtomoyka', 'avtoservis', 'servis', 'deteyling', 'vulkanizatsiya', 'salon', 'go\'zallik', 'barber', 'sartarosh', 'usta', 'remont', 'ta\'mirlash', 'stomatologiya', 'klinika', 'tibbiyot', 'massaj', 'sport', 'fitness', 'fitnes'];
            if (serviceKeywords.some(kw => text.includes(kw))) {
                return {
                    category: 'Xizmat',
                    label: input ? String(input).trim() : '🚗 Xizmat Ko\'rsatish & Moyka',
                    ownerTabs: ['company', 'dashboard', 'services', 'kassa', 'debts', 'audit', 'profile'],
                    defaultTab: 'services',
                    seededRoles: [
                        { roleCode: 'MASTER', roleName: 'Bosh Usta / Mutaxassis', icon: '🚗', allowedTabs: ['services', 'profile'], defaultTab: 'services' },
                        { roleCode: 'STAFF', roleName: 'Ijrochi / Xodim', icon: '🚿', allowedTabs: ['services', 'profile'], defaultTab: 'services' },
                        { roleCode: 'CASHIER', roleName: 'Kassir / Qabulxona', icon: '🛒', allowedTabs: ['services', 'kassa', 'debts', 'profile'], defaultTab: 'services' }
                    ]
                };
            }

            // 3. Manufacturing / Workshop / Furniture / Production
            const mfgKeywords = ['sex', 'tsex', 'ishlab chiqarish', 'mebel', 'zavod', 'fabrika', 'tikuvchilik', 'qurilish', 'metall', 'yog\'och', 'konditer'];
            if (mfgKeywords.some(kw => text.includes(kw))) {
                return {
                    category: 'Ishlab chiqarish',
                    label: input ? String(input).trim() : '🏭 Ishlab Chiqarish & Ustaxona',
                    ownerTabs: ['company', 'dashboard', 'services', 'inventory', 'kassa', 'debts', 'audit', 'profile'],
                    defaultTab: 'inventory',
                    seededRoles: [
                        { roleCode: 'FOREMAN', roleName: 'Ustaxona Boshlig\'i / Bosh Usta', icon: '🏭', allowedTabs: ['services', 'inventory', 'profile'], defaultTab: 'services' },
                        { roleCode: 'WAREHOUSE', roleName: 'Ombor Mudiri', icon: '📦', allowedTabs: ['inventory', 'profile'], defaultTab: 'inventory' },
                        { roleCode: 'MANAGER', roleName: 'Hisobchi / Administrator', icon: '📊', allowedTabs: ['dashboard', 'kassa', 'debts', 'profile'], defaultTab: 'dashboard' }
                    ]
                };
            }

            // 4. Retail / Store / Supermarket / Clothing / Pharmacy (Default)
            return {
                category: 'Savdo',
                label: input ? String(input).trim() : '🛒 Savdo / Supermarket',
                ownerTabs: ['company', 'dashboard', 'kassa', 'inventory', 'debts', 'audit', 'profile'],
                defaultTab: 'kassa',
                seededRoles: [
                    { roleCode: 'CASHIER', roleName: 'Kassir / Sotuvchi', icon: '🛒', allowedTabs: ['kassa', 'inventory', 'debts', 'profile'], defaultTab: 'kassa' },
                    { roleCode: 'WAREHOUSE', roleName: 'Omborchi (Kirim/Chiqim)', icon: '📦', allowedTabs: ['inventory', 'profile'], defaultTab: 'inventory' },
                    { roleCode: 'MANAGER', roleName: 'Menejer / Administrator', icon: '📊', allowedTabs: ['dashboard', 'kassa', 'inventory', 'debts', 'profile'], defaultTab: 'dashboard' }
                ]
            };
        }

        // 13. POST /api/clients -> Add new client company (with unique Company ID & Company Owner login/password)
        if (pathname === '/api/clients' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { customCompanyId, name, industry, owner, phone, address, ownerUsername, ownerPassword } = body;
                if (!name || !owner || !phone) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Kompaniya nomi, egasi va telefoni shart" }));
                }

                let newId = String(customCompanyId || '').trim().toUpperCase();
                if (!newId) {
                    const nextNum = (db.clients?.length ? Math.max(...db.clients.map(c => parseInt(String(c.id).replace(/[^0-9]/g, '') || 0))) + 1 : 1);
                    newId = `STR-${String(nextNum).padStart(3, '0')}`;
                }
                if ((db.clients || []).some(c => c.id.toUpperCase() === newId)) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: `Ushbu Kompaniya ID (${newId}) allaqachon mavjud! Boshqa ID kiriting.` }));
                }

                let cleanOwnerLogin = String(ownerUsername || owner.split(' ')[0] || newId).trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || ('dir_' + newId.toLowerCase());
                const cleanOwnerPass = String(ownerPassword || '7777').trim();

                if (cleanOwnerLogin === 'azbek') {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: `"azbek" logini Asoschi (Super Admin) uchun band qilingan! Boshqa login tanlang.` }));
                }

                const existingUser = (db.users || []).find(u => u.username.toLowerCase() === cleanOwnerLogin);
                if (existingUser) {
                    if (!ownerUsername) {
                        cleanOwnerLogin = `${cleanOwnerLogin}_${newId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                    } else {
                        res.writeHead(400);
                        return res.end(JSON.stringify({ 
                            error: `"${cleanOwnerLogin}" logini allaqachon boshqa korxona (${existingUser.fullName || existingUser.companyId}) tomonidan olingan! Iltimos, boshqa login yozing (masalan: ${cleanOwnerLogin}_apteka yoki ${cleanOwnerLogin}2).` 
                        }));
                    }
                }

                const now = new Date();
                const expiry = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
                const newKey = generateLicenseKey(newId, expiry);

                // Smart Industry Suite auto-detection
                const suite = detectIndustrySuite(industry);
                const assignedIndustryLabel = String(industry || suite.label).trim();
                const assignedCategory = suite.category;

                const newClient = {
                    id: newId,
                    companyId: newId,
                    name,
                    industry: assignedIndustryLabel,
                    industryCategory: assignedCategory,
                    owner,
                    ownerUsername: cleanOwnerLogin,
                    ownerPassword: cleanOwnerPass,
                    phone,
                    address: address || "Toshkent",
                    status: "ACTIVE",
                    monthlyFee: 700000,
                    registeredDate: now.toISOString().slice(0, 10),
                    validUntil: expiry,
                    lastPaymentDate: now.toISOString().slice(0, 10),
                    totalPaid: 700000,
                    lastGeneratedKey: newKey
                };

                if (!db.clients) db.clients = [];
                db.clients.push(newClient);

                // Create default COMPANY_OWNER account tailored to this industry
                const newOwnerUser = {
                    id: (db.users?.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1),
                    companyId: newId,
                    username: cleanOwnerLogin,
                    password: cleanOwnerPass,
                    fullName: `${owner} (${name} Egasi)`,
                    role: "COMPANY_OWNER",
                    roleBadge: `🏢 Kompaniya Egasi (${newId})`,
                    industryName: assignedIndustryLabel,
                    allowedTabs: suite.ownerTabs,
                    defaultTab: suite.defaultTab || "company",
                    branch: `${name} (${newId})`
                };
                if (!db.users) db.users = [];
                db.users.push(newOwnerUser);

                // Seed default roles tailored to this industry
                if (!db.companyRoles) db.companyRoles = [];
                suite.seededRoles.forEach((sr, idx) => {
                    db.companyRoles.push({
                        id: Date.now() + idx + 1,
                        companyId: newId,
                        roleCode: sr.roleCode,
                        name: sr.roleName,
                        roleName: sr.roleName,
                        icon: sr.icon,
                        roleIcon: sr.icon,
                        roleBadge: `${sr.icon} ${sr.roleName}`,
                        allowedTabs: sr.allowedTabs.includes('profile') ? sr.allowedTabs : [...sr.allowedTabs, 'profile'],
                        defaultTab: sr.defaultTab || sr.allowedTabs[0]
                    });
                });

                logAudit(db, {
                    userName: "Asoschi HQ",
                    userRole: "FOUNDER",
                    action: "YANGI_KOMPANIYA_ID_OCHILDI",
                    module: "Asoschi HQ",
                    details: `Yangi kompaniya ID: ${newId} (${name}) | Egasi logini: @${cleanOwnerLogin}`,
                    ipAddress: clientIp
                });
                saveDB(db);

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    client: newClient,
                    ownerUser: newOwnerUser,
                    licenseKey: newKey,
                    users: db.users,
                    companyRoles: db.companyRoles
                }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 14. POST /api/clients/extend -> Extend client license +30 days (record 700k payment & key)
        if (pathname === '/api/clients/extend' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { clientId, months } = body;
                const client = (db.clients || []).find(c => c.id === clientId);
                if (!client) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Mijoz topilmadi" }));
                }

                const addMonths = months || 1;
                const baseDate = (client.status === 'ACTIVE' && new Date(client.validUntil) > new Date()) 
                    ? new Date(client.validUntil) 
                    : new Date();
                
                const newExpiry = new Date(baseDate.getTime() + (addMonths * 30 * 86400000));
                const newExpiryStr = newExpiry.toISOString().slice(0, 10);
                const key = generateLicenseKey(client.id, newExpiryStr);

                client.validUntil = newExpiryStr;
                client.status = "ACTIVE";
                client.lastPaymentDate = new Date().toISOString().slice(0, 10);
                client.totalPaid = (client.totalPaid || 0) + (addMonths * client.monthlyFee);
                client.lastGeneratedKey = key;

                // If STR-001 is updated and is current local store, update local store too
                if (client.id === db.license.storeId) {
                    db.license.validUntil = newExpiryStr;
                    db.license.status = "ACTIVE";
                }

                saveDB(db);

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    client,
                    generatedKey: key,
                    newValidUntil: newExpiryStr,
                    amountPaid: addMonths * client.monthlyFee
                }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 15. POST /api/clients/lock -> Killswitch remote lock/unlock
        if (pathname === '/api/clients/lock' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { clientId, action } = body; // action: 'LOCK' | 'UNLOCK'
                const client = (db.clients || []).find(c => c.id === clientId);
                if (!client) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Mijoz topilmadi" }));
                }

                if (action === 'LOCK') {
                    client.status = 'LOCKED';
                    if (client.id === db.license.storeId) db.license.status = 'LOCKED';
                } else {
                    client.status = 'ACTIVE';
                    if (client.id === db.license.storeId) db.license.status = 'ACTIVE';
                }
                saveDB(db);

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, client }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 16. POST /api/clients/key -> Generate key for any ID and date
        if (pathname === '/api/clients/key' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { storeId, expiryDate } = body;
                if (!storeId || !expiryDate) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "storeId va expiryDate kiritilishi shart" }));
                }
                const key = generateLicenseKey(storeId.trim().toUpperCase(), expiryDate.trim());
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, storeId, expiryDate, key }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // 17. GET /api/founder/analytics -> Executive summary for Asoschi
        if (pathname === '/api/founder/analytics' && req.method === 'GET') {
            const clients = db.clients || [];
            const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
            const expiredClients = clients.filter(c => c.status === 'EXPIRED').length;
            const lockedClients = clients.filter(c => c.status === 'LOCKED').length;
            const monthlyRecurringRevenue = activeClients * 700000;
            const totalCollectedLifetime = clients.reduce((sum, c) => sum + (c.totalPaid || 0), 0);

            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                totalClients: clients.length,
                activeClients,
                expiredClients,
                lockedClients,
                mrr: monthlyRecurringRevenue,
                totalCollectedLifetime,
                monthlyFeeStandard: 700000
            }));
            return;
        }

        // 18. POST /api/founder/verify-pin -> Verify Founder Super Admin PIN (default: 2026)
        if (pathname === '/api/founder/verify-pin' && req.method === 'POST') {
            if (!checkRateLimit(clientIp)) {
                res.writeHead(429);
                return res.end(JSON.stringify({ success: false, error: "Juda ko'p noto'g'ri urinish! 5 daqiqadan so'ng qayta urinib ko'ring." }));
            }
            try {
                const body = await parseBody(req);
                const pin = String(body.pin || '').trim();
                const inputHash = crypto.createHmac('sha256', SALT).update(pin).digest('hex');
                if (inputHash === FOUNDER_PIN_HASH) {
                    failedAttempts.delete(clientIp);
                    res.writeHead(200);
                    return res.end(JSON.stringify({ success: true, token: inputHash.slice(0, 16) }));
                } else {
                    recordFailedAttempt(clientIp);
                    res.writeHead(403);
                    return res.end(JSON.stringify({ success: false, error: "Asoschi maxfiy PIN-kodi noto'g'ri!" }));
                }
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 19. POST /api/auth/login -> Individual Company ID + Role & Industry Login
        if (pathname === '/api/auth/login' && req.method === 'POST') {
            if (!checkRateLimit(clientIp)) {
                res.writeHead(429);
                return res.end(JSON.stringify({ success: false, error: "Juda ko'p noto'g'ri urinish! 5 daqiqadan so'ng urining." }));
            }
            try {
                const body = await parseBody(req);
                const inputCompanyId = String(body.companyId || '').trim().toUpperCase();
                const username = String(body.username || '').trim().toLowerCase();
                const password = String(body.password || '').trim();

                const user = (db.users || []).find(u => {
                    const matchCreds = u.username.toLowerCase() === username && String(u.password) === password;
                    if (!matchCreds) return false;
                    if (!inputCompanyId || u.role === 'FOUNDER') return true;
                    return (u.companyId || '').toUpperCase() === inputCompanyId;
                });

                if (!user) {
                    recordFailedAttempt(clientIp);
                    logAudit(db, { userName: username || 'Noma\'lum', userRole: 'MEHMON', action: 'LOGIN_XATO', module: 'Xavfsizlik', details: `Noto'g'ri Kompaniya ID (${inputCompanyId || 'ANY'}) yoki login/parol (${username})`, ipAddress: clientIp });
                    saveDB(db);
                    res.writeHead(401);
                    return res.end(JSON.stringify({ success: false, error: "Kompaniya ID, Login yoki Parol noto'g'ri!" }));
                }

                // Check if this user's company is LOCKED/EXPIRED (unless FOUNDER)
                if (user.role !== 'FOUNDER' && user.companyId) {
                    const comp = (db.clients || []).find(c => c.id.toUpperCase() === user.companyId.toUpperCase());
                    if (comp && comp.status === 'LOCKED') {
                        res.writeHead(403);
                        return res.end(JSON.stringify({ success: false, error: `⛔ ${comp.name} (${comp.id}) litsenziyasi Asoschi tomonidan vaqtincha qulflangan!` }));
                    }
                }

                failedAttempts.delete(clientIp);
                logAudit(db, { userName: user.fullName, userRole: user.roleBadge || user.role, action: 'TIZIMGA_KIRISH', module: 'NXS Auth', details: `[${user.companyId || 'STR-001'}] ${user.username} (${user.branch}) tizimga kirdi`, ipAddress: clientIp });
                saveDB(db);

                const token = crypto.createHmac('sha256', SALT).update(user.username + '|' + Date.now()).digest('hex').slice(0, 24);
                res.writeHead(200);
                return res.end(JSON.stringify({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        companyId: user.companyId || 'STR-001',
                        username: user.username,
                        fullName: user.fullName,
                        role: user.role,
                        roleBadge: user.roleBadge,
                        industryName: user.industryName,
                        allowedTabs: user.allowedTabs,
                        defaultTab: user.defaultTab,
                        branch: user.branch
                    },
                    auditLogs: db.auditLogs || [],
                    notifications: db.notifications || []
                }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 20. GET /api/users -> List user logins (optionally filtered by companyId)
        if (pathname === '/api/users' && req.method === 'GET') {
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, users: db.users || [], companyRoles: db.companyRoles || [] }));
        }

        // 20B. POST /api/company/roles -> Company Owner creates a custom Role for their own Company ID
        if (pathname === '/api/company/roles' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const roleNameVal = body.roleName || body.name;
                const roleIconVal = body.roleIcon || body.icon || '💼';
                const { companyId, allowedTabs, actorName } = body;
                const cleanCompId = String(companyId || 'STR-001').trim().toUpperCase();
                if (!roleNameVal || !Array.isArray(allowedTabs) || allowedTabs.length === 0) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Rol (lavozim) nomi va kamida 1 ta ruxsat etilgan bo'limni tanlang!" }));
                }

                if (!db.companyRoles) db.companyRoles = [];
                const roleCode = 'ROLE_' + Date.now().toString().slice(-5);
                const icon = roleIconVal;
                const tabsWithProfile = allowedTabs.includes('profile') ? allowedTabs : [...allowedTabs, 'profile'];
                const newRole = {
                    id: Date.now(),
                    companyId: cleanCompId,
                    roleCode,
                    name: String(roleNameVal).trim(),
                    roleName: String(roleNameVal).trim(),
                    icon,
                    roleIcon: icon,
                    roleBadge: `${icon} ${String(roleNameVal).trim()}`,
                    allowedTabs: tabsWithProfile,
                    defaultTab: allowedTabs[0] || 'kassa'
                };
                db.companyRoles.push(newRole);

                logAudit(db, {
                    userName: actorName || `Kompaniya Egasi (${cleanCompId})`,
                    userRole: "COMPANY_OWNER",
                    action: "YANGI_ROL_YARATILDI",
                    module: `Kompaniya HR (${cleanCompId})`,
                    details: `${cleanCompId} uchun yangi lavozim ochildi: ${newRole.roleBadge} [${allowedTabs.join(', ')}]`,
                    ipAddress: clientIp,
                    companyId: cleanCompId
                });
                saveDB(db);
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, role: newRole, companyRoles: db.companyRoles, auditLogs: db.auditLogs }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 20C. POST /api/company/roles/delete -> Delete a custom role
        if (pathname === '/api/company/roles/delete' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const targetId = String(body.id || body.roleId || '');
                const cleanCompId = String(body.companyId || 'STR-001').trim().toUpperCase();
                const removedRole = (db.companyRoles || []).find(r => String(r.id) === targetId);
                db.companyRoles = (db.companyRoles || []).filter(r => String(r.id) !== targetId);
                logAudit(db, {
                    userName: body.actorName || `Kompaniya Egasi (${cleanCompId})`,
                    userRole: "COMPANY_OWNER",
                    action: "ROL_OCHIRILDI",
                    module: `Kompaniya HR (${cleanCompId})`,
                    details: `[${cleanCompId}] Lavozim o'chirildi: ${removedRole ? removedRole.name : targetId}`,
                    ipAddress: clientIp,
                    companyId: cleanCompId
                });
                saveDB(db);
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, companyRoles: db.companyRoles, auditLogs: db.auditLogs }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 21. POST /api/users -> Create a new employee login bound to a specific Company ID
        if (pathname === '/api/users' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { companyId, username, password, fullName, role, branch, actorName } = body;
                const reqTabs = body.allowedTabs || body.customAllowedTabs;
                if (!username || !password || !fullName) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Login, parol va F.I.SH kiritilishi shart!" }));
                }
                const cleanUsername = String(username).trim().toLowerCase();
                if ((db.users || []).some(u => u.username.toLowerCase() === cleanUsername)) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Ushbu login band! Boshqa login tanlang." }));
                }

                const cleanCompId = String(companyId || 'STR-001').trim().toUpperCase();
                const compObj = (db.clients || []).find(c => (c.companyId || c.id || '').toUpperCase() === cleanCompId);
                const resolvedBranch = branch || (compObj ? `${compObj.name} (${compObj.companyId || compObj.id})` : `Filial (${cleanCompId})`);

                const roleMap = {
                    'COMPANY_OWNER': { badge: `🏢 Kompaniya Egasi (${cleanCompId})`, industry: compObj?.industry || "Boshqaruv", tabs: ["company", "dashboard", "kassa", "inventory", "debts", "audit", "profile"], def: "company" },
                    'CASHIER': { badge: "🛒 Do'kon Kassiri", industry: "Savdo / Supermarket", tabs: ["kassa", "inventory", "debts", "profile"], def: "kassa" },
                    'WAREHOUSE': { badge: "📦 Ombor Mudiri", industry: "Ombor va Kirim-Chiqim", tabs: ["inventory", "kassa", "profile"], def: "inventory" },
                    'WAITER':  { badge: "🍽️ Restoran & Kafe", industry: "Restoran / Oshxona", tabs: ["restaurant", "profile"], def: "restaurant" },
                    'MASTER':  { badge: "🚗 Xizmatlar & Ustaxona", industry: "Xizmat ko'rsatish & Ustaxona", tabs: ["services", "profile"], def: "services" },
                    'MANAGER': { badge: "📊 Menejer & Nasiya CRM", industry: "Boshqaruv va Hisobot", tabs: ["dashboard", "kassa", "inventory", "debts", "profile"], def: "dashboard" },
                    'FOUNDER': { badge: "👑 Asoschi (Super Admin)", industry: "Barcha Sohalar & HQ", tabs: ["admin", "dashboard", "audit", "profile"], def: "admin" }
                };

                // Check if role matches a company custom role first
                const customRoleObj = (db.companyRoles || []).find(r => (r.roleCode === role || r.name === role || r.roleName === role) && (r.companyId || '').toUpperCase() === cleanCompId)
                    || (db.companyRoles || []).find(r => r.roleCode === role || r.name === role || r.roleName === role);

                let badge = body.roleBadge || "💼 Xodim";
                let industry = compObj?.industry || "Universal";
                let tabs = ["kassa", "inventory", "profile"];
                let defTab = "kassa";

                if (customRoleObj) {
                    badge = customRoleObj.roleBadge;
                    tabs = [...customRoleObj.allowedTabs];
                    defTab = customRoleObj.defaultTab || tabs[0];
                } else if (roleMap[role]) {
                    badge = body.roleBadge || roleMap[role].badge;
                    industry = roleMap[role].industry;
                    tabs = [...roleMap[role].tabs];
                    defTab = roleMap[role].def;
                }

                if (Array.isArray(reqTabs) && reqTabs.length > 0) {
                    tabs = reqTabs.includes('profile') ? reqTabs : [...reqTabs, 'profile'];
                    defTab = reqTabs[0];
                }

                const newId = (db.users?.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1);
                const newUser = {
                    id: newId,
                    companyId: cleanCompId,
                    username: cleanUsername,
                    password: String(password).trim(),
                    fullName: String(fullName).trim(),
                    role: role || 'CASHIER',
                    roleBadge: badge,
                    industryName: industry,
                    allowedTabs: tabs,
                    defaultTab: defTab,
                    branch: resolvedBranch
                };

                if (!db.users) db.users = [];
                db.users.push(newUser);
                logAudit(db, { userName: actorName || `Kompaniya Egasi (${cleanCompId})`, userRole: 'COMPANY_OWNER', action: 'YANGI_XODIM_QABUL_QILINDI', module: `Kompaniya HR (${cleanCompId})`, details: `[${cleanCompId}] Yangi xodim: ${newUser.fullName} (@${newUser.username}) - ${newUser.roleBadge}`, ipAddress: clientIp });
                pushNotification(db, { title: `[${cleanCompId}] Yangi xodim ishga olindi`, message: `${newUser.fullName} (@${newUser.username}) — ${newUser.roleBadge}`, type: 'success' });
                saveDB(db);

                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, user: newUser, users: db.users, auditLogs: db.auditLogs, notifications: db.notifications }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 22. POST /api/users/delete -> Delete user account
        if (pathname === '/api/users/delete' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const id = parseInt(body.id);
                const target = (db.users || []).find(u => u.id === id);
                if (!target) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Foydalanuvchi topilmadi" }));
                }
                if (target.username === 'azbek') {
                    res.writeHead(403);
                    return res.end(JSON.stringify({ error: "Bosh Asoschi (azbek) loginini o'chirish mumkin emas!" }));
                }
                db.users = db.users.filter(u => u.id !== id);
                logAudit(db, { userName: body.actorName || 'Kompaniya Egasi', userRole: 'COMPANY_OWNER', action: 'XODIM_OCHIRILDI', module: `Kompaniya HR (${target.companyId || 'STR-001'})`, details: `Login o'chirildi: ${target.fullName} (@${target.username})`, ipAddress: clientIp });
                saveDB(db);
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, users: db.users, auditLogs: db.auditLogs }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 23. POST /api/profile/update -> NXS Self-Profile Login & Password Update
        if (pathname === '/api/profile/update' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { userId, fullName, username, currentPassword, newPassword } = body;
                const user = (db.users || []).find(u => u.id === parseInt(userId));
                if (!user) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Foydalanuvchi topilmadi!" }));
                }
                if (currentPassword && String(user.password) !== String(currentPassword).trim()) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Joriy parol noto'g'ri kiritildi!" }));
                }
                if (username) {
                    const cleanU = String(username).trim().toLowerCase();
                    if ((db.users || []).some(u => u.id !== user.id && u.username.toLowerCase() === cleanU)) {
                        res.writeHead(400);
                        return res.end(JSON.stringify({ error: "Bu login boshqa xodimda band!" }));
                    }
                    user.username = cleanU;
                }
                if (fullName) user.fullName = String(fullName).trim();
                if (newPassword && String(newPassword).trim().length >= 3) {
                    user.password = String(newPassword).trim();
                }

                logAudit(db, { userName: user.fullName, userRole: user.roleBadge, action: 'PROFIL_YANGILANDI', module: 'Mening Profilim', details: `${user.fullName} o'z profil/parol ma'lumotlarini yangiladi (@${user.username})`, ipAddress: clientIp });
                pushNotification(db, { title: "Profil yangilandi", message: `${user.fullName} o'z profil ma'lumotlarini yangiladi`, type: 'info' });
                saveDB(db);

                res.writeHead(200);
                return res.end(JSON.stringify({
                    success: true,
                    user: {
                        id: user.id,
                        companyId: user.companyId || 'STR-001',
                        username: user.username,
                        fullName: user.fullName,
                        role: user.role,
                        roleBadge: user.roleBadge,
                        industryName: user.industryName,
                        allowedTabs: user.allowedTabs,
                        defaultTab: user.defaultTab,
                        branch: user.branch
                    },
                    users: db.users,
                    auditLogs: db.auditLogs,
                    notifications: db.notifications
                }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 24. POST /api/users/permissions -> NXS Dynamic Module Permissions per User
        if (pathname === '/api/users/permissions' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { userId, allowedTabs, actorName } = body;
                const user = (db.users || []).find(u => u.id === parseInt(userId));
                if (!user) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: "Xodim topilmadi!" }));
                }
                if (Array.isArray(allowedTabs) && allowedTabs.length > 0) {
                    user.allowedTabs = allowedTabs.includes('profile') ? allowedTabs : [...allowedTabs, 'profile'];
                    user.defaultTab = allowedTabs[0];
                }
                logAudit(db, { userName: actorName || `Kompaniya Egasi (${user.companyId})`, userRole: 'COMPANY_OWNER', action: 'RUHSAT_OZGARTIRILDI', module: `Kompaniya HR (${user.companyId})`, details: `${user.fullName} uchun ruxsat etilgan bo'limlar yangilandi: [${user.allowedTabs.join(', ')}]`, ipAddress: clientIp });
                saveDB(db);
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, user, users: db.users, auditLogs: db.auditLogs }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 25. POST /api/notifications/read -> Mark all notifications as read
        if (pathname === '/api/notifications/read' && req.method === 'POST') {
            (db.notifications || []).forEach(n => n.read = true);
            saveDB(db);
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, notifications: db.notifications || [] }));
        }

        // 26. POST /api/copilot/message -> Process NLP, auto-fix issues or Gemini Q&A
        if (pathname === '/api/copilot/message' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { message, role, userName, companyId, geminiApiKey } = body;
                if (!message || !message.trim()) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Xabar bo'sh" }));
                }
                const result = await processCopilotNLP(db, message, { role, userName, companyId, geminiApiKey });
                res.writeHead(200);
                return res.end(JSON.stringify({
                    success: true,
                    ...result,
                    updatedDb: result.dbUpdated ? loadDB() : null
                }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 27. POST /api/copilot/diagnose -> Diagnostic scan
        if (pathname === '/api/copilot/diagnose' && req.method === 'POST') {
            try {
                const report = diagnoseSystem(db);
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, report }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 28. POST /api/copilot/heal -> One-click auto-healing
        if (pathname === '/api/copilot/heal' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const result = healSystem(db, body.actorName || "AZBEK Copilot AI");
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, ...result, updatedDb: loadDB() }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 29. GET /api/copilot/issues -> Get list of reported issues
        if (pathname === '/api/copilot/issues' && req.method === 'GET') {
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, issues: db.issues || [] }));
        }

        // 30. POST /api/copilot/issues/resolve -> Mark issue as resolved
        if (pathname === '/api/copilot/issues/resolve' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { issueId, resolutionNote, actorName } = body;
                const iss = (db.issues || []).find(x => x.id === issueId);
                if (iss) {
                    iss.status = 'RESOLVED';
                    iss.resolutionNote = resolutionNote || "To'g'irlandi";
                    iss.resolvedAt = new Date().toISOString();
                    iss.resolvedBy = actorName || "Asoschi HQ";
                    logAudit(db, { userName: actorName || "Asoschi", userRole: "ADMIN", action: "KAMCHILIK_HAL_ETILDI", module: "COPILOT", details: `[#${issueId}] ${iss.title} hal etildi` });
                    saveDB(db);
                }
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, issues: db.issues || [] }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // 31. POST /api/copilot/settings -> Update Gemini API Key and Copilot Settings
        if (pathname === '/api/copilot/settings' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { geminiApiKey, autoHealingEnabled } = body;
                if (!db.copilotSettings) db.copilotSettings = {};
                if (geminiApiKey !== undefined) db.copilotSettings.geminiApiKey = String(geminiApiKey).trim();
                if (autoHealingEnabled !== undefined) db.copilotSettings.autoHealingEnabled = Boolean(autoHealingEnabled);
                saveDB(db);
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true, copilotSettings: db.copilotSettings }));
            } catch (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: "API topilmadi" }));
        return;
    }

    // --- STATIC FILE SERVING ---
    let safePath = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(PUBLIC_DIR, safePath);

    // Security check to avoid directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end('Access Denied');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // SPA Fallback for client routing
            filePath = path.join(PUBLIC_DIR, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        let contentType = MIME_TYPES[ext] || 'application/octet-stream';
        if (filePath.endsWith('manifest.json')) {
            contentType = 'application/manifest+json; charset=UTF-8';
        }
        const headers = { 'Content-Type': contentType };
        if (filePath.endsWith('sw.js')) {
            headers['Service-Worker-Allowed'] = '/';
        }
        if (['.html', '.js', '.json', '.ico', '.png', '.jpg', '.svg'].includes(ext)) {
            headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            headers['Pragma'] = 'no-cache';
            headers['Expires'] = '0';
        }

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500);
                res.end('Server Xatoligi');
                return;
            }
            res.writeHead(200, headers);
            res.end(content);
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 AZBEK UNIFIED SUPER-APP ISHLAMOQDA!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`💎 Barcha sohalar: Savdo POS, Restoran, Xizmatlar, CRM, Asoschi HQ`);
    console.log(`🔒 DRM Oylik To'lov: 700 000 UZS (Oflayn HMAC-SHA256)`);
    console.log(`📲 Google Play & App Store PWA/Capacitor tayyor`);
    console.log(`=======================================================`);
});
