const mysql = require('mysql2');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : '';
const finalUrl = dbUrl.includes('?') ? dbUrl.split('?')[0] : dbUrl;

const db = mysql.createConnection({
    uri: finalUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro de conexão MySQL:', err.message);
    } else {
        console.log('✅ Conectado ao MySQL na nuvem!');
    }
});

module.exports = db;