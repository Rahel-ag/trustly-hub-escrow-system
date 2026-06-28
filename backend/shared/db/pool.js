process.on('exit', (code) => {
    console.trace('Process exiting with code:', code);
});
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected DB pool error:', err);
});

module.exports = pool;