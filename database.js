/**
 * AZBEK GROUP — Universal Cloud Database Sync Engine (v1.0)
 * Dual-Support: MongoDB Atlas & Supabase (PostgreSQL) + Durable Local Fallback
 * 
 * Auto-detects:
 * 1. MONGODB_URI (e.g. mongodb+srv://azbek:<pass>@cluster0.mongodb.net/azbek_db)
 * 2. SUPABASE_URL + SUPABASE_KEY
 * 3. Graceful fallback to data/azbek_db.json
 */

const fs = require('fs');
const path = require('path');

let MongoClient = null;
let createClient = null;

try {
    MongoClient = require('mongodb').MongoClient;
} catch (e) {
    console.warn('[DB ADAPTER] MongoDB moduli topilmadi, lokal rejim ishlatiladi');
}

try {
    createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
    console.warn('[DB ADAPTER] Supabase moduli topilmadi, lokal rejim ishlatiladi');
}

class CloudDatabaseManager {
    constructor() {
        this.provider = 'LOCAL_JSON'; // 'MONGODB' | 'SUPABASE' | 'LOCAL_JSON'
        this.connected = false;
        this.lastSyncTime = null;
        this.lastError = null;
        this.mongoClient = null;
        this.mongoDb = null;
        this.supabaseClient = null;
        this.pendingSaveTimeout = null;
    }

    async init(initialData, onHydrateCallback) {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        // 1. Try MongoDB Atlas if URI is provided
        if (mongoUri && MongoClient) {
            try {
                console.log('[DB ADAPTER] MongoDB Atlas ga ulanish urinilmoqda...');
                this.mongoClient = new MongoClient(mongoUri, {
                    serverSelectionTimeoutMS: 5000,
                    connectTimeoutMS: 10000
                });
                await this.mongoClient.connect();
                this.mongoDb = this.mongoClient.db('azbek_superapp');
                this.provider = 'MONGODB';
                this.connected = true;
                this.lastSyncTime = new Date().toISOString();
                console.log('✅ [DB ADAPTER] MongoDB Atlas ga muvaffaqiyatli ulandi!');

                // Hydrate from cloud or seed cloud
                const stateDoc = await this.mongoDb.collection('app_state').findOne({ _id: 'main_state' });
                if (stateDoc && stateDoc.data) {
                    console.log('📥 [DB ADAPTER] MongoDB Atlas bulutidan so\'nggi ma\'lumotlar yuklandi.');
                    if (typeof onHydrateCallback === 'function') {
                        onHydrateCallback(stateDoc.data);
                    }
                } else if (initialData) {
                    console.log('📤 [DB ADAPTER] MongoDB Atlas yangi bo\'sh klaster: boshlang\'ich ma\'lumotlar yuklanmoqda...');
                    await this.mongoDb.collection('app_state').updateOne(
                        { _id: 'main_state' },
                        { $set: { data: initialData, updatedAt: new Date() } },
                        { upsert: true }
                    );
                }
                return;
            } catch (err) {
                console.error('❌ [DB ADAPTER] MongoDB Atlas ga ulanishda xato:', err.message);
                this.lastError = 'MongoDB: ' + err.message;
                this.provider = 'LOCAL_JSON';
                this.connected = false;
            }
        }

        // 2. Try Supabase if URL and Key are provided
        if (supabaseUrl && supabaseKey && createClient) {
            try {
                console.log('[DB ADAPTER] Supabase bulutiga ulanish urinilmoqda...');
                this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
                    auth: { persistSession: false }
                });

                // Test query on app_state table
                const { data, error } = await this.supabaseClient
                    .from('app_state')
                    .select('payload, updated_at')
                    .eq('id', 'main')
                    .single();

                if (!error && data && data.payload) {
                    console.log('✅ [DB ADAPTER] Supabase ga muvaffaqiyatli ulandi va ma\'lumotlar yuklandi!');
                    this.provider = 'SUPABASE';
                    this.connected = true;
                    this.lastSyncTime = new Date().toISOString();
                    if (typeof onHydrateCallback === 'function') {
                        onHydrateCallback(data.payload);
                    }
                    return;
                } else if (error && error.code === 'PGRST116') {
                    // Record not found - seed initial data
                    console.log('📤 [DB ADAPTER] Supabase bo\'sh jadval: boshlang\'ich ma\'lumotlar kiritilmoqda...');
                    await this.supabaseClient
                        .from('app_state')
                        .upsert({ id: 'main', payload: initialData, updated_at: new Date().toISOString() });
                    this.provider = 'SUPABASE';
                    this.connected = true;
                    this.lastSyncTime = new Date().toISOString();
                    return;
                } else {
                    throw error || new Error('Supabase javob bermadi');
                }
            } catch (err) {
                console.warn('⚠️ [DB ADAPTER] Supabase ga ulanishda ogohlantirish:', err.message);
                this.lastError = 'Supabase: ' + err.message;
                this.provider = 'LOCAL_JSON';
                this.connected = false;
            }
        }

        // 3. Fallback to Local JSON
        console.log('ℹ️ [DB ADAPTER] Bulutli baza parametrlari topilmadi. Mahalliy data/azbek_db.json faol.');
        this.provider = 'LOCAL_JSON';
        this.connected = true;
    }

    // Asynchronous non-blocking cloud persistence
    scheduleCloudSync(data) {
        if (!this.connected || this.provider === 'LOCAL_JSON') return;

        if (this.pendingSaveTimeout) {
            clearTimeout(this.pendingSaveTimeout);
        }

        // Debounce sync by 1.5 seconds to batch rapid cashier clicks
        this.pendingSaveTimeout = setTimeout(async () => {
            try {
                if (this.provider === 'MONGODB' && this.mongoDb) {
                    await this.mongoDb.collection('app_state').updateOne(
                        { _id: 'main_state' },
                        { $set: { data: data, updatedAt: new Date() } },
                        { upsert: true }
                    );
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
        }, 1500);
    }

    getStatus() {
        const rawUri = process.env.MONGODB_URI || process.env.MONGO_URL || '';
        const rawSupabase = process.env.SUPABASE_URL || '';

        // Mask credentials for safety
        const maskedMongo = rawUri ? rawUri.replace(/:([^@]+)@/, ':****@') : 'O\'rnatilmagan';
        const maskedSupabase = rawSupabase ? rawSupabase.replace(/^https:\/\/(.{4}).*(\.supabase\.co.*)$/, 'https://$1***$2') : 'O\'rnatilmagan';

        return {
            provider: this.provider,
            connected: this.connected,
            lastSyncTime: this.lastSyncTime,
            lastError: this.lastError,
            details: {
                mongoConfigured: !!rawUri,
                mongoMasked: maskedMongo,
                supabaseConfigured: !!rawSupabase,
                supabaseMasked: maskedSupabase,
                localPath: 'data/azbek_db.json'
            }
        };
    }
}

module.exports = new CloudDatabaseManager();
