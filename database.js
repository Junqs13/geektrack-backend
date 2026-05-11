const mysql = require('mysql2');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : '';
const finalUrl = dbUrl.includes('?') ? dbUrl.split('?')[0] : dbUrl;

// O SEGREDO: Usar createPool em vez de createConnection
const pool = mysql.createPool({
    uri: finalUrl,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10, // Mantém até 10 conexões abertas e gerencia as quedas
    queueLimit: 0,
    enableKeepAlive: true, // Tenta manter o Aiven acordado
    keepAliveInitialDelay: 0
});

// Testa a conexão do Pool
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erro de conexão MySQL no Pool:', err.message);
    } else {
        console.log('✅ Conectado ao MySQL na nuvem (Pool Ativo e Blindado)!');
        connection.release(); // Libera a conexão de volta para a piscina
    }
});

module.exports = pool;