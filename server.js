const express = require('express');
const cors = require('cors');
const db = require('./database'); 

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API do GeekTrack está rodando no MySQL!');
});

// ==========================================
// ROTAS PARA CATEGORIAS
// ==========================================

// 1. CREATE: POST
app.post('/categorias', (req, res) => {
    const { nome } = req.body; 
    
    if (!nome) {
        return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
    }

    const query = `INSERT INTO categorias (nome) VALUES (?)`;
    
    db.query(query, [nome], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ id: results.insertId, nome: nome });
    });
});

// 2. READ: GET
app.get('/categorias', (req, res) => {
    const query = `SELECT * FROM categorias`;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(results);
    });
});

// ==========================================
// ROTAS PARA ITENS (O ACERVO GEEK E MUSICAL)
// ==========================================

// 1. CREATE: POST
app.post('/itens', (req, res) => {
    const { titulo, tipo, foto_url, consumido, categoria_id } = req.body;

    if (!titulo || !tipo || !categoria_id) {
        return res.status(400).json({ erro: 'Título, tipo e ID da categoria são obrigatórios.' });
    }

    const query = `INSERT INTO itens (titulo, tipo, foto_url, consumido, categoria_id) VALUES (?, ?, ?, ?, ?)`;
    
    // No MySQL, o BOOLEAN é tratado como TINYINT (1 ou 0)
    const valorConsumido = consumido ? 1 : 0; 

    db.query(query, [titulo, tipo, foto_url, valorConsumido, categoria_id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ 
            id: results.insertId, 
            titulo: titulo, 
            mensagem: 'Item cadastrado com sucesso no acervo!' 
        });
    });
});

// 2. READ: GET
app.get('/itens', (req, res) => {
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
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        
        const itensFormatados = results.map(item => ({
            ...item,
            consumido: item.consumido === 1
        }));

        res.json(itensFormatados);
    });
});

// 3. UPDATE: PUT
app.put('/itens/:id', (req, res) => {
    const { id } = req.params; 
    const { titulo, tipo, foto_url, consumido, categoria_id } = req.body;

    const query = `
        UPDATE itens 
        SET titulo = ?, tipo = ?, foto_url = ?, consumido = ?, categoria_id = ? 
        WHERE id = ?
    `;
    
    const valorConsumido = consumido ? 1 : 0; 

    db.query(query, [titulo, tipo, foto_url, valorConsumido, categoria_id, id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ erro: 'Item não encontrado para atualização.' });
        }
        res.json({ mensagem: 'Item atualizado com sucesso!' });
    });
});

// 4. DELETE: DELETE
app.delete('/itens/:id', (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM itens WHERE id = ?`;

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ erro: 'Item não encontrado para exclusão.' });
        }
        res.json({ mensagem: 'Item removido do acervo com sucesso!' });
    });
});

// ==========================================
// INICIANDO O SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});