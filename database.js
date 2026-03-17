const mysql = require('mysql2');

// Cria a conexão com o MySQL do XAMPP (usuário root e sem senha por padrão)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geektrack_db' // O banco que você acabou de criar no phpMyAdmin
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        return;
    }
    console.log('Conectado com sucesso ao banco de dados MySQL (XAMPP).');

    // Criação das Tabelas (Sintaxe adaptada para MySQL)
    const criarTabelaCategorias = `
        CREATE TABLE IF NOT EXISTS categorias (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL
        )
    `;

    const criarTabelaUsuarios = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL
        )
    `;

    const criarTabelaItens = `
        CREATE TABLE IF NOT EXISTS itens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            foto_url VARCHAR(255),
            consumido BOOLEAN DEFAULT FALSE,
            categoria_id INT,
            FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
        )
    `;

    const criarTabelaEmprestimos = `
        CREATE TABLE IF NOT EXISTS emprestimos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            data_emprestimo DATE DEFAULT (CURRENT_DATE),
            data_devolucao DATE,
            item_id INT,
            usuario_id INT,
            FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `;

    // Executa as queries de criação
    db.query(criarTabelaCategorias, (err) => { if (err) console.error("Erro Categorias:", err.message); });
    db.query(criarTabelaUsuarios, (err) => { if (err) console.error("Erro Usuários:", err.message); });
    db.query(criarTabelaItens, (err) => { if (err) console.error("Erro Itens:", err.message); });
    db.query(criarTabelaEmprestimos, (err) => { if (err) console.error("Erro Empréstimos:", err.message); });
});

module.exports = db;