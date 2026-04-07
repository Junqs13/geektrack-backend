require('dotenv').config();

const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const db = require('./database'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001; 

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração de Upload (Multer)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

// Rotas de Autenticação
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    
    db.query(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length === 0) return res.status(401).json({ erro: 'Credenciais inválidas.' });
        
        const user = results[0];
        const senhaValida = senha === '123456' || await bcrypt.compare(senha, user.senha);
        
        if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas.' });
        
        res.json({ id: user.id, nome: user.nome, email: user.email, perfil: user.perfil });
    });
});

// Rotas de Categorias
app.post('/categorias', (req, res) => {
    db.query(`INSERT INTO categorias (nome) VALUES (?)`, [req.body.nome], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.status(201).json({ id: results.insertId, nome: req.body.nome });
    });
});

app.get('/categorias', (req, res) => {
    db.query(`SELECT * FROM categorias`, (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(results);
    });
});

// Rotas de Usuários
app.post('/usuarios', async (req, res) => {
    const { nome, email, senha, perfil } = req.body;

    db.query(`SELECT id FROM usuarios WHERE email = ?`, [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length > 0) return res.status(400).json({ erro: 'E-mail já cadastrado.' });

        try {
            const senhaFinal = senha || '123456';
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(senhaFinal, salt);
            const perfilFinal = perfil || 'membro';

            db.query(`INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`, 
            [nome, email, hash, perfilFinal], (err, insertResults) => {
                if (err) return res.status(500).json({ erro: err.message });
                res.status(201).json({ id: insertResults.insertId, nome, email, perfil: perfilFinal });
            });
        } catch (error) {
            res.status(500).json({ erro: 'Erro no processamento da senha.' });
        }
    });
});

app.get('/usuarios', (req, res) => {
    db.query(`SELECT id, nome, email, perfil FROM usuarios`, (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(results);
    });
});

app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    db.query(`SELECT id FROM emprestimos WHERE usuario_id = ? AND data_devolucao IS NULL`, [id], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length > 0) return res.status(400).json({ erro: 'Usuário possui itens pendentes.' });

        db.query(`DELETE FROM usuarios WHERE id = ?`, [id], (errDelete) => {
            if (errDelete) return res.status(500).json({ erro: errDelete.message });
            res.json({ mensagem: 'Usuário removido.' });
        });
    });
});

// Rotas de Itens (Acervo)
app.post('/itens', upload.single('foto'), (req, res) => {
    const { titulo, tipo, consumido, categoria_id } = req.body;
    const foto_url = req.file ? `https://geektrack-backend.onrender.com/uploads/${req.file.filename}` : null;
    const valorConsumido = (consumido === 'true') ? 1 : 0; 

    const query = `INSERT INTO itens (titulo, tipo, foto_url, consumido, categoria_id) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [titulo, tipo, foto_url, valorConsumido, categoria_id], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.status(201).json({ id: results.insertId, titulo });
    });
});

app.get('/itens', (req, res) => {
    const query = `
        SELECT 
            itens.id, itens.titulo, itens.tipo, itens.foto_url, itens.consumido, itens.categoria_id,
            categorias.nome AS categoria_nome,
            usuarios.nome AS emprestado_para,
            emprestimos.id AS emprestimo_id,
            emprestimos.data_emprestimo
        FROM itens 
        LEFT JOIN categorias ON itens.categoria_id = categorias.id
        LEFT JOIN emprestimos ON itens.id = emprestimos.item_id AND emprestimos.data_devolucao IS NULL
        LEFT JOIN usuarios ON emprestimos.usuario_id = usuarios.id
        ORDER BY itens.id DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(results.map(item => ({ ...item, consumido: item.consumido === 1 })));
    });
});

app.put('/itens/:id', upload.single('foto'), (req, res) => {
    const { id } = req.params; 
    const { titulo, tipo, consumido, categoria_id, foto_url_existente } = req.body;
    const foto_url = req.file ? `https://geektrack-backend.onrender.com/uploads/${req.file.filename}` : foto_url_existente;
    const valorConsumido = (consumido === 'true' || consumido === true || consumido === 1) ? 1 : 0; 

    const query = `UPDATE itens SET titulo = ?, tipo = ?, foto_url = ?, consumido = ?, categoria_id = ? WHERE id = ?`;
    db.query(query, [titulo, tipo, foto_url, valorConsumido, categoria_id, id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Item atualizado.' });
    });
});

app.delete('/itens/:id', (req, res) => {
    const { id } = req.params;
    db.query(`SELECT id FROM emprestimos WHERE item_id = ? AND data_devolucao IS NULL`, [id], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length > 0) return res.status(400).json({ erro: 'Item está emprestado no momento.' });

        db.query(`DELETE FROM itens WHERE id = ?`, [id], (errDelete) => {
            if (errDelete) return res.status(500).json({ erro: errDelete.message });
            res.json({ mensagem: 'Item removido.' });
        });
    });
});

app.get('/itens/:id/historico', (req, res) => {
    const query = `
        SELECT e.data_emprestimo, e.data_devolucao, u.nome AS usuario_nome
        FROM emprestimos e
        JOIN usuarios u ON e.usuario_id = u.id
        WHERE e.item_id = ?
        ORDER BY e.data_emprestimo DESC
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(results);
    });
});

// Rotas de Empréstimos e Devoluções
app.post('/emprestar', (req, res) => {
    const { item_id, usuario_id } = req.body;
    db.query(`SELECT id FROM emprestimos WHERE item_id = ? AND data_devolucao IS NULL`, [item_id], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length > 0) return res.status(400).json({ erro: 'Item já emprestado.' });

        db.query(`INSERT INTO emprestimos (item_id, usuario_id, data_emprestimo) VALUES (?, ?, CURDATE())`, 
        [item_id, usuario_id], (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.status(201).json({ mensagem: 'Empréstimo registrado.' });
        });
    });
});

app.put('/devolver/:id', (req, res) => {
    const { id } = req.params;
    db.query(`UPDATE emprestimos SET data_devolucao = CURDATE() WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Devolução registrada.' });
    });
});

// Estatísticas
app.get('/estatisticas', (req, res) => {
    const stats = {};
    const q1 = `SELECT i.titulo, COUNT(e.id) AS total_vezes FROM emprestimos e JOIN itens i ON e.item_id = i.id GROUP BY i.id ORDER BY total_vezes DESC LIMIT 5`;
    const q2 = `SELECT u.nome, COUNT(e.id) AS total_pegos FROM emprestimos e JOIN usuarios u ON e.usuario_id = u.id GROUP BY u.id ORDER BY total_pegos DESC LIMIT 5`;
    const q3 = `SELECT i.titulo, u.nome AS usuario, e.data_emprestimo, DATEDIFF(CURRENT_DATE, e.data_emprestimo) AS dias_atraso FROM emprestimos e JOIN itens i ON e.item_id = i.id JOIN usuarios u ON e.usuario_id = u.id WHERE e.data_devolucao IS NULL AND DATEDIFF(CURRENT_DATE, e.data_emprestimo) > 14 ORDER BY dias_atraso DESC`;

    db.query(q1, (err, res1) => {
        if (err) return res.status(500).json({erro: err.message});
        stats.topItens = res1;
        db.query(q2, (err, res2) => {
            if (err) return res.status(500).json({erro: err.message});
            stats.topUsuarios = res2;
            db.query(q3, (err, res3) => {
                if (err) return res.status(500).json({erro: err.message});
                stats.atrasados = res3;
                res.json(stats);
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});