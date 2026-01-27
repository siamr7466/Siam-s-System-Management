require('dotenv').config();
const { Client } = require('pg');

const testConnection = async (type, connStr) => {
    if (!connStr) {
        console.log(`[${type}] Skipped: Undefined`);
        return;
    }
    const masked = connStr.replace(/:([^:@]+)@/, ':****@');
    console.log(`[${type}] Testing: ${masked}`);

    // SSL is required for Supabase
    const client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log(`[${type}] SUCCESS!`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`[${type}] FAILED: ${err.message}`);
        return false;
    }
};

const start = async () => {
    await testConnection('TRANSACTION', process.env.DATABASE_URL);
    await testConnection('SESSION', process.env.DIRECT_URL);
};

start();
