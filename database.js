const mysql = require('mysql2');
require('dotenv').config();

// 1. Pega a URL do Render e remove espaços em branco acidentais no início ou no fim
let dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : '';

// 2. Remove a parte "?ssl-mode=REQUIRED" que causa conflito no Node.js
if (dbUrl.includes('?')) {
    dbUrl = dbUrl.split('?')[0];
}

// 3. Tenta conectar com a URL limpa
const db = mysql.createConnection({
    uri: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco MySQL na nuvem:', err.message);
    } else {
        console.log('✅ Conectado com sucesso ao MySQL na nuvem (Aiven)!');
    }
});

module.exports = db;