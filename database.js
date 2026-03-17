const sqlite3 = require('sqlite3').verbose();

// Conecta ao banco de dados (isso criará o arquivo database.sqlite na sua pasta)
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados SQLite.');
    }
});

// Criação das Tabelas
db.serialize(() => {
    // Tabela de Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
    )`);

    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )`);

    // Tabela de Itens (O Acervo Geek e Musical)
    db.run(`CREATE TABLE IF NOT EXISTS itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        tipo TEXT NOT NULL, -- Ex: 'Vinil', 'Jogo', 'Quadrinho'
        foto_url TEXT,
        consumido BOOLEAN DEFAULT 0, -- 0 para falso, 1 para verdadeiro
        categoria_id INTEGER,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id)
    )`);

    // Tabela de Empréstimos
    db.run(`CREATE TABLE IF NOT EXISTS emprestimos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_emprestimo DATE DEFAULT CURRENT_DATE,
        data_devolucao DATE,
        item_id INTEGER,
        usuario_id INTEGER,
        FOREIGN KEY (item_id) REFERENCES itens (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )`);
});

module.exports = db;