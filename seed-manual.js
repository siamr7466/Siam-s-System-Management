const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connStr = process.env.DATABASE_URL;

async function seed() {
    const client = new Client({
        connectionString: connStr,
        // Remove SSL for local postgres
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const email = 'siamrahman7466@gmail.com';
        const password = '199113';
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = 'Siam Rahman';
        const id = 'default-user-id';
        const now = new Date().toISOString();

        // Check if user exists
        const res = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            await client.query(
                'UPDATE "User" SET password = $1, "updatedAt" = $2 WHERE email = $3',
                [hashedPassword, now, email]
            );
            console.log('User updated');
        } else {
            await client.query(
                'INSERT INTO "User" (id, email, name, password, "updatedAt") VALUES ($1, $2, $3, $4, $5)',
                [id, email, name, hashedPassword, now]
            );
            console.log('User created');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

seed();
