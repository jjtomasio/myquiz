
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Forçar a ligação a usar UTF-8 para evitar erros na importação
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Criar base de dados: `myquiz_db`
DROP DATABASE IF EXISTS `myquiz_db`;  
CREATE DATABASE IF NOT EXISTS `myquiz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `myquiz_db`;

-- --------------------------------------------------------
--
-- Estrutura da tabela `init_jogo`
--

DROP TABLE IF EXISTS `init_jogo`;
CREATE TABLE IF NOT EXISTS `init_jogo` (
  `id_init_jogo` int NOT NULL AUTO_INCREMENT,
  `num_perguntas` int NOT NULL,
  `designacao` varchar(150) NOT NULL,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_init_jogo`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- dados da tabela `init_jogo`
--

INSERT INTO `init_jogo` (`id_init_jogo`, `num_perguntas`, `designacao`, `data_criacao`) VALUES
(1, 5, 'quiz1', '2026-06-09 17:21:13'),
(2, 5, 'Ditados Populares', '2026-06-10 01:23:56'),
(3, 5, 'Seleção Nacional de Futebol', '2026-06-10 01:25:30');

-- --------------------------------------------------------

--
-- Estrutura da tabela `perguntas`
--

DROP TABLE IF EXISTS `perguntas`;
CREATE TABLE IF NOT EXISTS `perguntas` (
  `id_perg` int NOT NULL AUTO_INCREMENT,
  `id_init_jogo` int NOT NULL,
  `descricao` text NOT NULL,
  `tema` varchar(50) NOT NULL,
  `activa` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`id_perg`),
  KEY `id_init_jogo` (`id_init_jogo`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- dados da tabela `perguntas`
--

INSERT INTO `perguntas` (`id_perg`, `id_init_jogo`, `descricao`, `tema`, `activa`) VALUES
(1, 1, 'Qual é o maior planeta do Sistema Solar?', 'sistema solar', 'Y'),
(2, 1, 'Quem pintou o famoso quadro \"Mona Lisa\"?', 'mona lisa', 'Y'),
(3, 1, 'Qual é a capital da Austrália?', 'canguru', 'Y'),
(4, 1, 'Em que ano terminou a Segunda Guerra Mundial?', 'alemanha nazista', 'Y'),
(5, 1, 'Qual é o elemento químico com o símbolo \"O\"?', 'química', 'Y'),
(6, 2, 'O que significa o ditado \"A cavalo dado não se olha o dente\"?', 'Cavalo', 'Y'),
(7, 2, 'Qual é o significado de \"Grão a grão, enche a galinha o papo\"?', 'galinha', 'Y'),
(8, 2, 'O que expressa o provérbio \"Quem se mete com atalhos, mete-se em trabalhos\"?', 'estrada', 'Y'),
(9, 2, 'Qual é o significado de \"Mais vale um pássaro na mão do que dois a voar\"?', 'pássaros', 'Y'),
(10, 2, 'O que significa \"Água mole em pedra dura, tanto bate até que fura\"?', 'riacho', 'Y'),
(11, 3, 'Quem é o maior marcador de sempre da Seleção Nacional de futebol?', 'desporto', 'Y'),
(12, 3, 'Em que ano é que Portugal se sagrou Campeão Europeu de Futebol sénior masculino?', 'desporto', 'Y'),
(13, 3, 'Qual destes selecionadores orientou Portugal na conquista do Euro 2016?', 'desporto', 'Y'),
(14, 3, 'Contra que país é que Portugal jogou a final do Euro 2004?', 'desporto', 'Y'),
(15, 3, 'Quem marcou o golo decisivo na final do Euro 2016 contra a França?', 'desporto', 'Y');

-- --------------------------------------------------------

--
-- Estrutura da tabela `respostas`
--

DROP TABLE IF EXISTS `respostas`;
CREATE TABLE IF NOT EXISTS `respostas` (
  `id_resp` int NOT NULL AUTO_INCREMENT,
  `id_perg` int NOT NULL,
  `id_init_jogo` int NOT NULL,
  `texto_resposta` text NOT NULL,
  `valor` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_resp`),
  KEY `id_perg` (`id_perg`),
  KEY `id_init_jogo` (`id_init_jogo`)
) ENGINE=MyISAM AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- dados da tabela `respostas`
--

INSERT INTO `respostas` (`id_resp`, `id_perg`, `id_init_jogo`, `texto_resposta`, `valor`) VALUES
(1, 1, 1, 'Júpiter', 10),
(2, 1, 1, 'Saturno', 0),
(3, 1, 1, 'Terra', 0),
(4, 1, 1, 'Marte', 0),
(5, 2, 1, 'Leonardo da Vinci', 10),
(6, 2, 1, 'Vincent van Gogh', 0),
(7, 2, 1, 'Pablo Picasso', 0),
(8, 2, 1, 'Michelangelo', 0),
(9, 3, 1, 'Camberra', 10),
(10, 3, 1, 'Sydney', 0),
(11, 3, 1, 'Melbourne', 0),
(12, 3, 1, 'Brisbane', 0),
(13, 4, 1, '1945', 10),
(14, 4, 1, '1918', 0),
(15, 4, 1, '1939', 0),
(16, 4, 1, '1950', 0),
(17, 5, 1, 'Oxigénio', 10),
(18, 5, 1, 'Ouro', 0),
(19, 5, 1, 'Ósmio', 0),
(20, 5, 1, 'Ozono', 0),
(21, 6, 2, 'Não devemos criticar ou colocar defeitos num presente que recebemos.', 10),
(22, 6, 2, 'Os cavalos antigos tinham dentes mais frágeis que os atuais.', 0),
(23, 6, 2, 'Devemos sempre recusar ofertas de pessoas que não conhecemos bem.', 0),
(24, 6, 2, 'É azarado olhar para a boca de um animal de grande porte.', 0),
(25, 7, 2, 'Com paciência e economia atingem-se grandes objetivos.', 10),
(26, 7, 2, 'As galinhas preferem comer milho cozido em vez de cru.', 0),
(27, 7, 2, 'Uma pessoa gulosa acaba por passar mal por comer demasiado depressa.', 0),
(28, 7, 2, 'O desperdício de comida atrai má sorte para o ambiente doméstico.', 0),
(29, 8, 2, 'Tentar caminhos mais fáceis ou ilegítimos pode trazer problemas inesperados.', 10),
(30, 8, 2, 'A agricultura em terrenos estreitos exige ferramentas muito caras.', 0),
(31, 8, 2, 'Fazer caminhadas na natureza ajuda a melhorar a saúde física.', 0),
(32, 8, 2, 'Quem viaja sozinho por estradas secundárias chega sempre mais depressa.', 0),
(33, 9, 2, 'É melhor garantir um ganho pequeno mas seguro do que arriscar tudo por algo incerto.', 10),
(34, 9, 2, 'A caça de aves era uma atividade controlada pela realeza portuguesa.', 0),
(35, 9, 2, 'Quem tem animais de estimação deve mantê-los trancados numa gaiola.', 0),
(36, 9, 2, 'As oportunidades duplicam quando não temos medo de arriscar dinheiro.', 0),
(37, 10, 2, 'Com persistência e determinação consegue-se alcançar o que parece impossível.', 10),
(38, 10, 2, 'A erosão provocada pelas chuvas fortes destrói as fundações das casas.', 0),
(39, 10, 2, 'Não vale a pena insistir com pessoas teimosas porque elas nunca mudam.', 0),
(40, 10, 2, 'A água mineral pura tem propriedades químicas que corroem superfícies.', 0),
(41, 11, 3, 'Cristiano Ronaldo', 10),
(42, 11, 3, 'Eusébio', 0),
(43, 11, 3, 'Pauleta', 0),
(44, 11, 3, 'Luís Figo', 0),
(45, 12, 3, '2004', 0),
(46, 12, 3, '2012', 0),
(47, 12, 3, '2016', 10),
(48, 12, 3, '2020', 0),
(49, 13, 3, 'Luiz Felipe Scolari', 0),
(50, 13, 3, 'Fernando Santos', 10),
(51, 13, 3, 'Paulo Bento', 0),
(52, 13, 3, 'Roberto Martínez', 0),
(53, 14, 3, 'França', 0),
(54, 14, 3, 'Grécia', 10),
(55, 14, 3, 'Espanha', 0),
(56, 14, 3, 'Inglaterra', 0),
(57, 15, 3, 'Nani', 0),
(58, 15, 3, 'Ricardo Quaresma', 0),
(59, 15, 3, 'Éder', 10),
(60, 15, 3, 'João Mário', 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `resultado_serie`
--

DROP TABLE IF EXISTS `resultado_serie`;
CREATE TABLE IF NOT EXISTS `resultado_serie` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_serie` int NOT NULL,
  `id_user` int NOT NULL,
  `id_perg` int NOT NULL,
  `id_resp` int NOT NULL,
  `resultado_valor` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_serie` (`id_serie`),
  KEY `id_user` (`id_user`),
  KEY `id_perg` (`id_perg`),
  KEY `id_resp` (`id_resp`)
) ENGINE=MyISAM AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `serie`
--

DROP TABLE IF EXISTS `serie`;
CREATE TABLE IF NOT EXISTS `serie` (
  `id_serie` int NOT NULL AUTO_INCREMENT,
  `id_init_jogo` int NOT NULL,
  `id_user` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_serie`),
  KEY `id_init_jogo` (`id_init_jogo`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- --------------------------------------------------------

--
-- Estrutura da tabela `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
