import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Conexão Pool à Base de Dados MySQL

//require('dotenv').config();
//const mysql = require('mysql2');
/*DB_HOST=sql7.freesqldatabase.com
DB_USER=sql7830939
DB_PASSWORD=wneveRbXXf
DB_NAME=sql7830939
DB_PORT=3306
PORT=5000
*/

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'myquiz_db',
    waitForConnections: true,
    connectionLimit: 10
});
/*
const pool = mysql.createPool({ //

    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});
*/

// 1. ROTA VERIFIÇAO
//CRUD (READ): Verificar ligação ao backend / Estado do Quiz
app.get('/api/status', (req, res) => {
    res.json({ 
        success: true, 
        message: 'O quiz está pronto a ser iniciado!',
        timestamp: new Date()
    });
});


// 2. ROTA INICIAL
// CRUD (READ): Obter total exato de perguntas ativas na base de dados
app.get('/api/total_perguntas_ativas', async (req, res) => {
    try {
        const [result] = await pool.query('SELECT COUNT(*) as total FROM perguntas WHERE activa = "Y"');
        res.json({ total: result[0].total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 3. ROTA DO FLUXO LER PERGUNTAS E RESPOSTAS
// CRUD (READ): Obter perguntas e as respectivas respostas
app.get('/api/init_jogo', async (req, res) => {
    try {
        console.log("--- NOVO QUIZ INICIADO ---");

        // 1. Obter o total de perguntas ativas
        const [totalPerguntasResult] = await pool.query(
            'SELECT COUNT(*) as total FROM perguntas WHERE activa = "Y"'
        );
        const totalPerguntasNoBanco = totalPerguntasResult[0].total;

        // 🔥 IMPORTANTE: Definir o header ANTES de qualquer validação ou return de esgotado
        res.setHeader('X-Total-Perguntas', totalPerguntasNoBanco.toString());

        const [todosQuizzes] = await pool.query(
            'SELECT DISTINCT id_init_jogo FROM perguntas WHERE activa = "Y"'
        );
        const totalQuizzesNoBanco = todosQuizzes.length;

        const jogadosParam = req.query.jogados || '';
        const IDsJogados = jogadosParam
            ? jogadosParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
            : [];

        if ((IDsJogados.length >= totalQuizzesNoBanco && totalQuizzesNoBanco > 0)) {
            return res.json({ esgotado: true, msg: "Não há mais quizzes" });
        }

        const quizzesDisponiveis = todosQuizzes.filter(q => !IDsJogados.includes(q.id_init_jogo));

        if (quizzesDisponiveis.length === 0) {
            return res.json({ esgotado: true, msg: "Não há mais quizzes" });
        }

        const quizEscolhido = quizzesDisponiveis[Math.floor(Math.random() * quizzesDisponiveis.length)];
        const id_init_jogo = quizEscolhido.id_init_jogo;

        const querySql = `
            SELECT p.*, ij.designacao 
            FROM perguntas p 
            INNER JOIN init_jogo ij ON p.id_init_jogo = ij.id_init_jogo 
            WHERE p.id_init_jogo = ? AND p.activa = "Y" 
            ORDER BY RAND() LIMIT 5
        `;
        const [perguntas] = await pool.query(querySql, [id_init_jogo]);
        const [respostas] = await pool.query('SELECT * FROM respostas WHERE id_init_jogo = ?', [id_init_jogo]);

        const estruturado = perguntas.map(p => {
            // CORREÇÃO AUXILIAR: Garantir o filtro correto por id da pergunta
            let opcoesFiltradas = respostas.filter(r => r.id_perg === p.id_perg);
            for (let i = opcoesFiltradas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [opcoesFiltradas[i], opcoesFiltradas[j]] = [opcoesFiltradas[j], opcoesFiltradas[i]];
            }
            return { ...p, opcoes: opcoesFiltradas };
        });

        res.json(estruturado);

    } catch (err) {
        console.error("Erro crítico na rota /api/init_jogo:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. ROTA DO FLUXO: SUBMETER DADOS 
//CRUD (CREATE): Inserir Utilizador, Série e as Respostas dadas
app.post('/api/submeter', async (req, res) => {
    const { user, respostas, id_init_jogo } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Validar se o e-mail já existe na tabela 'user'
        const [userQuery] = await connection.query('SELECT id_user FROM user WHERE email = ?', [user.email]);
        let userId;

        if (userQuery.length > 0) {
            userId = userQuery[0].id_user;
        } else {
            // Cria novo utilizador alinhado com os campos reais do SQL
            const [newUser] = await connection.query(
                'INSERT INTO user (nome, email, telefone) VALUES (?, ?, ?)',
                [user.nome, user.email, user.telefone]
            );
            userId = newUser.insertId;
        }

        // 2. Registar a Série associada ao utilizador (campos alinhados com o SQL)
        const [newSerie] = await connection.query(
            'INSERT INTO serie (id_init_jogo, id_user, criado_em) VALUES (?, ?, ?)',
            [id_init_jogo || 1, userId, new Date()]
        );
        const serieId = newSerie.insertId;

        // 3. Registar o resultado individual de cada resposta dada sequencialmente
        for (const resp of respostas) {
            await connection.query(
                'INSERT INTO resultado_serie (id_serie, id_user, id_perg, id_resp, resultado_valor) VALUES (?, ?, ?, ?, ?)',
                [serieId, userId, resp.id_perg, resp.id_resp, resp.valor]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Respostas gravadas com sucesso no MySQL!' });

    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message });
        console.log.error("Erro ao submeter respostas:", err);
    } finally {
        connection.release();
    }
});

// 5. ROTA DO FLUXO: LISTAR
// CRUD (READ): Obter todas as registos de jogadores/utilizadores


app.get('/api/users', async (req, res) => {
    try {
        const queryText = `
            SELECT 
    u.id_user, 
    u.nome, 
    u.email, 
    u.telefone, 
    s.criado_em,
    s.id_serie,
    IFNULL(pontuacao_jogo.total_jogo, 0) AS pontuacao_maxima,
    IFNULL(pontuacao_jogo.designacao_quiz, 'Nenhum') AS quiz_pontuacao_maxima
FROM user u
INNER JOIN serie s ON u.id_user = s.id_user
INNER JOIN init_jogo ij_serie ON s.id_init_jogo = ij_serie.id_init_jogo
INNER JOIN (
    SELECT 
        rs.id_serie,
        rs.id_user,
        SUM(rs.resultado_valor) AS total_jogo,
        -- minha flag19-06-2026. Agrupar e garantir que trazemos a designação certa
        MAX(ij_perg.designacao) AS designacao_quiz
    FROM resultado_serie rs
    INNER JOIN perguntas p ON rs.id_perg = p.id_perg
    INNER JOIN init_jogo ij_perg ON p.id_init_jogo = ij_perg.id_init_jogo
    GROUP BY rs.id_serie, rs.id_user
) AS pontuacao_jogo ON s.id_serie = pontuacao_jogo.id_serie AND u.id_user = pontuacao_jogo.id_user
WHERE pontuacao_jogo.total_jogo > 0
ORDER BY pontuacao_maxima DESC, s.criado_em DESC`;

        const [rows] = await pool.query(queryText);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 6. ROTA DO FLUXO: REMOVER UTILIZADOR
// CRUD (DELETE): Remover utilizador por ID

app.delete('/api/series/:id_serie', async (req, res) => {
    const { id_serie } = req.params;
    const { id_user } = req.query; // Passado via query string para validação

    if (!id_serie || !id_user) {
        return res.status(400).json({ error: "Parâmetros id_serie e id_user são obrigatórios." });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Eliminar os registos da tabela 'resultado_serie' associados a esta série
        await connection.query('DELETE FROM resultado_serie WHERE id_serie = ?', [id_serie]);

        // 2. Eliminar o registo da tabela 'serie'
        await connection.query('DELETE FROM serie WHERE id_serie = ?', [id_serie]);

        // 3. Verificar se ainda existem OUTRAS séries para este mesmo utilizador
        const [outrasSeries] = await connection.query(
            'SELECT COUNT(*) as total FROM serie WHERE id_user = ?',
            [id_user]
        );

        // 4. Se não existirem mais registos deste utilizador na tabela 'serie', removemos do 'user'
        if (outrasSeries[0].total === 0) {
            await connection.query('DELETE FROM user WHERE id_user = ?', [id_user]);
            console.log(`Utilizador ${id_user} removido por não ter mais jogos ativa.`);
        }

        await connection.commit();
        res.json({ success: true, message: 'Jogo removido e integridade de dados mantida!' });

    } catch (err) {
        await connection.rollback();
        console.error("Erro ao eliminar registo de série:", err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});


// 7. ROTA DO FLUXO: ALTERAR DADOS
// CRUD (UPDATE): Alterar o e-mail de um utilizador por ID
app.put('/api/users/:id_user/email', async (req, res) => {
    const { id_user } = req.params;
    const { email } = req.body;
    
    
    if (!id_user || !email) {
        return res.status(400).json({ error: "O ID do utilizador e o novo e-mail são obrigatórios." });
    }

    // Validação simples de e-mail no lado do servidor
    const emailcheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailcheck.test(email)) {
        return res.status(400).json({ error: "O formato do e-mail introduzido é inválido." });
    }

    try {
        // Atualiza o e-mail na tabela 'user'
        const [result] = await pool.query('UPDATE user SET email = ? WHERE id_user = ?', [email, id_user]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        res.json({ success: true, message: 'E-mail atualizado com sucesso!' });
    } catch (err) {
        console.error("Erro ao alterar e-mail do utilizador:", err);
        res.status(500).json({ error: err.message });
    }
});

// 8. ROTA EXTRA: popular dropdown
// CRUD (READ): Obter todos os jogos/quizzes disponíveis para o dropdown
app.get('/api/jogos_disponiveis', async (req, res) => {
    try {
        // Assume-se que tens uma tabela 'init_jogo' com 'id_init_jogo' e 'designacao'
        // Se não tiveres a tabela separada, podemos ir buscar diretamente às perguntas com DISTINCT
        const [rows] = await pool.query('SELECT DISTINCT id_init_jogo, designacao FROM init_jogo ORDER BY id_init_jogo ASC');

        // Caso a tabela 'init_jogo' não exista ou use outro nome, alternativa de recurso:
        // const [rows] = await pool.query('SELECT DISTINCT id_init_jogo, "Quiz " + id_init_jogo AS designacao FROM perguntas WHERE activa = "Y"');

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, async () => {
    console.log(`Servidor de API ativo na porta ${port}`);
    try {
        await pool.execute("SELECT 1");
        console.log("Ligação ao MySQL estabelecida com sucesso!");
    } catch (error) {
        console.log("Erro crítico ao ligar à base de dados MySQL. Verifica os parâmetros do .env");
    }
});