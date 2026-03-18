const bcrypt = require('bcrypt');
const db = require('./database'); // Puxa a sua conexão com o banco

async function gerarAdmin() {
    try {
        const nome = 'Admin Principal';
        const email = 'admin@geektrack.com'; // Você usará esse e-mail para logar
        const senhaPlana = '123456';         // A senha que você vai digitar na tela
        const perfil = 'admin';

        console.log('⏳ Criptografando a senha...');
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senhaPlana, salt);

        console.log('💾 Salvando no banco de dados...');
        const query = `INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`;
        
        db.query(query, [nome, email, senhaCriptografada, perfil], (err, results) => {
            if (err) {
                console.error('❌ Erro ao salvar no banco:', err.message);
                process.exit(1);
            }
            console.log('✅ Tudo certo! Primeiro Admin criado com sucesso no GeekTrack.');
            console.log(`➡️ E-mail para login: ${email}`);
            console.log(`➡️ Senha: ${senhaPlana}`);
            process.exit(0); // Encerra o script
        });

    } catch (erro) {
        console.error('❌ Erro no processo:', erro);
        process.exit(1);
    }
}

gerarAdmin();