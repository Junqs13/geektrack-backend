const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    uri: process.env.DATABASE_URL,
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