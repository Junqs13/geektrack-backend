const express = require('express');
const cors = require('cors');
const db = require('./database'); // Importa nossa configuração do banco

const app = express();
const PORT = 3001; 

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste básica
app.get('/', (req, res) => {
    res.send('API do GeekTrack está rodando!');
});

// ==========================================
// ROTAS PARA CATEGORIAS
// ==========================================

// 1. CREATE: Rota para criar uma nova categoria (POST)
app.post('/categorias', (req, res) => {
    const { nome } = req.body; 
    
    if (!nome) {
        return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
    }

    const query = `INSERT INTO categorias (nome) VALUES (?)`;
    
    db.run(query, [nome], function(err) {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ id: this.lastID, nome: nome });
    });
});

// 2. READ: Rota para listar todas as categorias (GET)
app.get('/categorias', (req, res) => {
    const query = `SELECT * FROM categorias`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(rows);
    });
});

// ==========================================
// ROTAS PARA ITENS (O ACERVO GEEK E MUSICAL)
// ==========================================

// 1. CREATE: Cadastrar um novo item no acervo (POST)
app.post('/itens', (req, res) => {
    const { titulo, tipo, foto_url, consumido, categoria_id } = req.body;

    if (!titulo || !tipo || !categoria_id) {
        return res.status(400).json({ erro: 'Título, tipo e ID da categoria são obrigatórios.' });
    }

    const query = `INSERT INTO itens (titulo, tipo, foto_url, consumido, categoria_id) VALUES (?, ?, ?, ?, ?)`;
    
    // O SQLite não tem um tipo booleano real, então salvamos true como 1 e false como 0
    const valorConsumido = consumido ? 1 : 0; 

    db.run(query, [titulo, tipo, foto_url, valorConsumido, categoria_id], function(err) {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ 
            id: this.lastID, 
            titulo: titulo, 
            mensagem: 'Item cadastrado com sucesso no acervo!' 
        });
    });
});

// 2. READ: Listar todos os itens com suas categorias (GET)
app.get('/itens', (req, res) => {
    // Usamos LEFT JOIN para trazer o nome da categoria junto com o item
    const query = `
        SELECT 
            itens.id, 
            itens.titulo, 
            itens.tipo, 
            itens.foto_url, 
            itens.consumido, 
            categorias.nome AS categoria_nome 
        FROM itens 
        LEFT JOIN categorias ON itens.categoria_id = categorias.id
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        
        // Converte o 0 e 1 do banco de volta para false/true no JSON 
        const itensFormatados = rows.map(item => ({
            ...item,
            consumido: item.consumido === 1
        }));

        res.json(itensFormatados);
    });
});

// ==========================================
// INICIANDO O SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});