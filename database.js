const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // Isso permite conectar na nuvem do Aiven sem bloquear
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