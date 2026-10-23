/**
 * AZBEK GROUP — Universal Cloud Database Sync Engine (v2.0)
 * Triple-Support: MongoDB Atlas, PostgreSQL (Render/Neon/Supabase) & Durable Local Fallback
 * Supports in-app live configuration and persistent storage
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'cloud_config.json');

let MongoClient = null;
let createClient = null;
let Pool = null;

try {
    MongoClient = require('mongodb').MongoClient;
} catch (e) {}

try {
    createClient = require('@supabase/supabase-js').createClient;
} catch (e) {}

try {
    Pool = require('pg').Pool;
} catch (e) {}

class CloudDatabaseManager {
    constructor() {
        this.provider = 'LOCAL_JSON'; // 'MONGODB' | 'POSTGRES' | 'SUPABASE' | 'LOCAL_JSON'
        this.connected = false;
        this.lastSyncTime = null;
        this.lastError = null;
        this.mongoClient = null;
        this.mongoDb = null;
        this.supabaseClient = null;
        this.pgPool = null;
        this.pendingSaveTimeout = null;
        this.activeUri = null;
    }

    loadSavedConfig() {
        try {
            if (fs.existsSync(CONFIG_FILE)) {
                return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
            }
        } catch (e) {}
        return {};
    }

    saveConfig(cfg) {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
        } catch (e) {}
    }

    async init(initialData, onHydrateCallback) {
        const saved = this.loadSavedConfig();
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || saved.mongoUri;
        const pgUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || saved.pgUrl;
        const supabaseUrl = process.env.SUPABASE_URL || saved.supabaseUrl;
        const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || saved.supabaseKey;

        // 1. Try MongoDB Atlas
        if (mongoUri && MongoClient) {
            try {
                console.log('[DB ADAPTER] MongoDB Atlas ga ulanmoqda...');
                this.mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 10000 });
                await this.mongoClient.connect();
                this.mongoDb = this.mongoClient.db('azbek_superapp');
                this.provider = 'MONGODB';
                this.connected = true;
                this.activeUri = mongoUri;
                this.lastSyncTime = new Date().toISOString();
                console.log('✅ [DB ADAPTER] MongoDB Atlas ga muvaffaqiyatli ulandi!');

                const stateDoc = await this.mongoDb.collection('app_state').findOne({ _id: 'main_state' });
                if (stateDoc && stateDoc.data) {
                    if (typeof onHydrateCallback === 'function') onHydrateCallback(stateDoc.data);
                } else if (initialData) {
                    await this.mongoDb.collection('app_state').updateOne(
                        { _id: 'main_state' },
                        { $set: { data: initialData, updatedAt: new Date() } },
                        { upsert: true }
                    );
                }
                return;
            } catch (err) {
                console.error('❌ [DB ADAPTER] MongoDB Atlas xatosi:', err.message);
                this.lastError = 'MongoDB: ' + err.message;
            }
        }

        // 2. Try PostgreSQL (Render Postgres, Neon, etc.)
        if (pgUrl && Pool) {
            try {
                console.log('[DB ADAPTER] PostgreSQL ga ulanmoqda...');
                this.pgPool = new Pool({
                    connectionString: pgUrl,
                    ssl: pgUrl.includes('localhost') ? false : { rejectUnauthorized: false }
                });
                await this.pgPool.query(`
                    CREATE TABLE IF NOT EXISTS azbek_state (
                        id VARCHAR(50) PRIMARY KEY,
                        payload JSONB NOT NULL,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `);
                this.provider = 'POSTGRES';
                this.connected = true;
                this.activeUri = pgUrl;
                this.lastSyncTime = new Date().toISOString();
                console.log('✅ [DB ADAPTER] PostgreSQL bulutli bazasiga muvaffaqiyatli ulandi!');

                const res = await this.pgPool.query(`SELECT payload FROM azbek_state WHERE id = 'main' LIMIT 1`);
                if (res.rows.length > 0 && res.rows[0].payload) {
                    if (typeof onHydrateCallback === 'function') onHydrateCallback(res.rows[0].payload);
                } else if (initialData) {
                    await this.pgPool.query(`
                        INSERT INTO azbek_state (id, payload, updated_at) 
                        VALUES ('main', $1, NOW()) 
                        ON CONFLICT (id) DO UPDATE SET payload = $1, updated_at = NOW();
                    `, [JSON.stringify(initialData)]);
                }
                return;
            } catch (err) {
                console.error('❌ [DB ADAPTER] PostgreSQL xatosi:', err.message);
                this.lastError = 'PostgreSQL: ' + err.message;
            }
        }

        // 3. Try Supabase REST
        if (supabaseUrl && supabaseKey && createClient) {
            try {
                console.log('[DB ADAPTER] Supabase ga ulanmoqda...');
                this.supabaseClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
                const { data, error } = await this.supabaseClient.from('app_state').select('payload').eq('id', 'main').single();
                if (!error && data && data.payload) {
                    this.provider = 'SUPABASE';
                    this.connected = true;
                    this.lastSyncTime = new Date().toISOString();
                    if (typeof onHydrateCallback === 'function') onHydrateCallback(data.payload);
                    return;
                } else if (error && error.code === 'PGRST116' && initialData) {
                    await this.supabaseClient.from('app_state').upsert({ id: 'main', payload: initialData, updated_at: new Date().toISOString() });
                    this.provider = 'SUPABASE';
                    this.connected = true;
                    this.lastSyncTime = new Date().toISOString();
                    return;
                }
            } catch (err) {
                console.warn('⚠️ [DB ADAPTER] Supabase xatosi:', err.message);
                this.lastError = 'Supabase: ' + err.message;
            }
        }

        console.log('ℹ️ [DB ADAPTER] Bulutli baza ulanmagan. Mahalliy data/azbek_db.json faol.');
        this.provider = 'LOCAL_JSON';
        this.connected = false;
    }

    async testAndConnect(inputUri, currentData) {
        const cleanUri = String(inputUri || '').trim();
        if (!cleanUri) throw new Error("Ulanish havolasi (URI) kiritilmadi!");

        if (cleanUri.startsWith('mongodb://') || cleanUri.startsWith('mongodb+srv://')) {
            if (!MongoClient) throw new Error("MongoDB drayveri o'rnatilmagan");
            const testClient = new MongoClient(cleanUri, { serverSelectionTimeoutMS: 6000, connectTimeoutMS: 8000 });
            await testClient.connect();
            const db = testClient.db('azbek_superapp');
            await db.command({ ping: 1 });

            // Push current state
            if (currentData) {
                await db.collection('app_state').updateOne(
                    { _id: 'main_state' },
                    { $set: { data: currentData, updatedAt: new Date() } },
                    { upsert: true }
                );
            }

            this.mongoClient = testClient;
            this.mongoDb = db;
            this.provider = 'MONGODB';
            this.connected = true;
            this.activeUri = cleanUri;
            this.lastSyncTime = new Date().toISOString();
            this.lastError = null;

            this.saveConfig({ mongoUri: cleanUri });
            return { success: true, provider: 'MONGODB', message: "MongoDB Atlas bulutli bazasiga muvaffaqiyatli ulandi!" };
        } else if (cleanUri.startsWith('postgresql://') || cleanUri.startsWith('postgres://')) {
            if (!Pool) throw new Error("PostgreSQL drayveri o'rnatilmagan");
            const testPool = new Pool({
                connectionString: cleanUri,
                ssl: cleanUri.includes('localhost') ? false : { rejectUnauthorized: false }
            });
            await testPool.query('SELECT 1');
            await testPool.query(`
                CREATE TABLE IF NOT EXISTS azbek_state (
                    id VARCHAR(50) PRIMARY KEY,
                    payload JSONB NOT NULL,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `);
            if (currentData) {
                await testPool.query(`
                    INSERT INTO azbek_state (id, payload, updated_at) 
                    VALUES ('main', $1, NOW()) 
                    ON CONFLICT (id) DO UPDATE SET payload = $1, updated_at = NOW();
                `, [JSON.stringify(currentData)]);
            }

            this.pgPool = testPool;
            this.provider = 'POSTGRES';
            this.connected = true;
            this.activeUri = cleanUri;
            this.lastSyncTime = new Date().toISOString();
            this.lastError = null;

            this.saveConfig({ pgUrl: cleanUri });
            return { success: true, provider: 'POSTGRES', message: "PostgreSQL bulutli bazasiga muvaffaqiyatli ulandi!" };
        } else {
            throw new Error("Noma'lum ulanish turi. mongodb+srv:// yoki postgresql:// bilan boshlanishi kerak.");
        }
    }

    scheduleCloudSync(data) {
        if (!this.connected || this.provider === 'LOCAL_JSON') return;

        if (this.pendingSaveTimeout) {
            clearTimeout(this.pendingSaveTimeout);
        }

        this.pendingSaveTimeout = setTimeout(async () => {
            try {
                if (this.provider === 'MONGODB' && this.mongoDb) {
                    await this.mongoDb.collection('app_state').updateOne(
                        { _id: 'main_state' },
                        { $set: { data: data, updatedAt: new Date() } },
                        { upsert: true }
                    );
                    this.lastSyncTime = new Date().toISOString();
                } else if (this.provider === 'POSTGRES' && this.pgPool) {
                    await this.pgPool.query(`
                        INSERT INTO azbek_state (id, payload, updated_at) 
                        VALUES ('main', $1, NOW()) 
                        ON CONFLICT (id) DO UPDATE SET payload = $1, updated_at = NOW();
                    `, [JSON.stringify(data)]);
                    this.lastSyncTime = new Date().toISOString();
                } else if (this.provider === 'SUPABASE' && this.supabaseClient) {
                    await this.supabaseClient
                        .from('app_state')
                        .upsert({ id: 'main', payload: data, updated_at: new Date().toISOString() });
                    this.lastSyncTime = new Date().toISOString();
                }
            } catch (err) {
                console.error(`[DB ADAPTER] ${this.provider} ga sinxronlashda xatolik:`, err.message);
                this.lastError = err.message;
            }
        }, 1200);
    }

    getStatus() {
        const saved = this.loadSavedConfig();
        const rawUri = this.activeUri || process.env.MONGODB_URI || process.env.DATABASE_URL || saved.mongoUri || saved.pgUrl || '';
        const masked = rawUri ? rawUri.replace(/:([^@]+)@/, ':****@') : "O'rnatilmagan";

        return {
            provider: this.provider,
            connected: this.connected,
            lastSyncTime: this.lastSyncTime,
            lastError: this.lastError,
            details: {
                maskedUri: masked,
                localPath: 'data/azbek_db.json'
            }
        };
    }
}

module.exports = new CloudDatabaseManager();
