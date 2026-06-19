import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('client');

  // Estados do Fluxo do Cliente
  const [passo, setPasso] = useState('welcome'); // welcome -> perguntas -> tempo_acabou -> fim
  const [imagemFundo, setImagemFundo] = useState(null);
  const [listaPerguntas, setListaPerguntas] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostasEscolhidas, setRespostasEscolhidas] = useState([]);
  const [quizzesJogados, setQuizzesJogados] = useState([]);
  const [designacaoAtual, setDesignacaoAtual] = useState('');
  const [quizzesEsgotados, setQuizzesEsgotados] = useState(false);
  const [totalPerguntasBanco, setTotalPerguntasBanco] = useState(0);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    autoriza_contacto: 'Y'
  });

  // Estados do Dashboard Administrativo
  const [usuariosAdmin, setUsuariosAdmin] = useState([]);
  const [carregandoAdmin, setCarregandoAdmin] = useState(false);
  const [errorAdmin, setErrorAdmin] = useState(null);

  // 1. Buscar o total de perguntas mal a app arranca
  useEffect(() => {
    // Procura o número total assim que a página abre
    fetch(`${API_URL}/total_perguntas_ativas`)
      .then(res => res.json())
      .then(data => {
        if (data && data.total) {
          setTotalPerguntasBanco(Number(data.total)); // 🔥 Força a conversão para Número
        }
      })
      .catch(err => console.error("Erro ao buscar total:", err));

    // Carrega o primeiro bloco de perguntas
    carregarPerguntas();
  }, []);

  const buscarTotalPerguntasAtivas = async () => {
    try {
      const res = await fetch(`${API_URL}/total_perguntas_ativas`);
      if (res.ok) {
        const data = await res.json();
        setTotalPerguntasBanco(data.total);
      }
    } catch (err) {
      console.error('Erro ao obter total de perguntas:', err);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'admin') {
      carregarDadosAdmin();
    }
  }, [abaAtiva]);

  const carregarDadosAdmin = async () => {
    setCarregandoAdmin(true);
    try {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error('Erro ao obter os utilizadores do servidor.');
      const data = await res.json();
      setUsuariosAdmin(data);
      setErrorAdmin(null);
    } catch (err) {
      setErrorAdmin(err.message);
    } finally {
      setCarregandoAdmin(false);
    }
  };

  const eliminarUtilizador = async (id_serie, id_user) => {
    if (!window.confirm('Pretendes eliminar esta tentativa de jogo permanentemente?')) return;
    try {
      // Chama o novo endpoint passando o id_serie na rota e o id_user como query parameter
      const res = await fetch(`${API_URL}/series/${id_serie}?id_user=${id_user}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Remove a linha correspondente do estado do painel administrativo imediatamente
        setUsuariosAdmin(usuariosAdmin.filter(user => user.id_serie !== id_serie));
      } else {
        alert('Erro ao processar a eliminação na base de dados.');
      }
    } catch (err) {
      alert('Erro na comunicação de rede com o servidor.');
    }
  };

  const sincronizarDados = async () => {
    await carregarDadosAdmin();
    alert('Dados sincronizados com sucesso!');
  };

  const selecionarOpcao = (id_perg, id_resp, valor) => {
    // IMPORTANTE: Removemos duplicados com base no id_perg para evitar que respostas à mesma pergunta inflem o score
    const filtradas = respostasEscolhidas.filter(r => r.id_perg !== id_perg);
    const novasRespostas = [...filtradas, { id_perg, id_resp, valor }];
    setRespostasEscolhidas(novasRespostas);

    if (indiceAtual < listaPerguntas.length - 1) {
      setTimeout(() => setIndiceAtual(indiceAtual + 1), 250);
    } else {
      setTimeout(() => setPasso('tempo_acabou'), 350);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : value
    });
  };

  const submeterDadosFinais = async (e) => {
    if (e) e.preventDefault();

    if (formData.autoriza_contacto !== 'Y') {
      setPasso('fim');
      return;
    }

    const payload = {
      user: formData,
      respostas: respostasEscolhidas,
      id_init_jogo: quizzesJogados[0] || 1
    };

    try {
      const response = await fetch(`${API_URL}/submeter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setPasso('fim');
      } else {
        alert("Erro reportado pelo servidor de base de dados.");
      }
    } catch (error) {
      alert("Falha de rede ao tentar comunicar com o servidor.");
    }
  };

  // 2. Limpar a função carregarPerguntas
  const carregarPerguntas = async (historicoAtual = quizzesJogados, manterPontos = false) => {
    setListaPerguntas([]);
    setIndiceAtual(0);

    if (!manterPontos) {
      setRespostasEscolhidas([]);
      setQuizzesJogados([]);
      setQuizzesEsgotados(false);
      // ATENÇÃO: Removemos daqui o setTotalPerguntasBanco(0) para não apagar o valor global!
      historicoAtual = [];
    }

    try {
      const listaJogadosQuery = historicoAtual.join(',');
      const url = `${API_URL}/init_jogo?t=${Date.now()}&jogados=${listaJogadosQuery}`;

      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error('Erro na resposta do servidor');

      const novosDados = await resposta.json();

      if (!Array.isArray(novosDados) || novosDados.esgotado) {
        setQuizzesEsgotados(true);
        return false;
      }

      const idDoJogoAtual = novosDados[0]?.id_init_jogo;
      if (idDoJogoAtual) {
        setDesignacaoAtual(novosDados[0].designacao || `Quiz #${idDoJogoAtual}`);
        if (!historicoAtual.includes(idDoJogoAtual)) {
          setQuizzesJogados([...historicoAtual, idDoJogoAtual]);
        }
      }

      setListaPerguntas([...novosDados]);
      return true;
    } catch (erro) {
      console.error("Erro ao buscar questionário:", erro);
      setQuizzesEsgotados(true);
      return false;
    }
  };

  // Cálculo reativo para a barra de progresso do topo
  const totalPerguntasJogo = Math.min(listaPerguntas.length, 5);
  const percentagemProgresso = totalPerguntasBanco > 0
    ? ((respostasEscolhidas.length / totalPerguntasBanco) * 100)
    : 0;

  // Atualiza a imagem de fundo dinamicamente sempre que a pergunta muda
  useEffect(() => {
    if (abaAtiva === 'client' && passo === 'perguntas' && listaPerguntas.length > 0 && listaPerguntas[indiceAtual]) {
      const temaAtual = listaPerguntas[indiceAtual].tema || 'culture';
      const novaImagem = `https://loremflickr.com/1280/720/${encodeURIComponent(temaAtual)}?lock=${indiceAtual}`;
      setImagemFundo(novaImagem);
    } else {
      setImagemFundo(null);
    }
  }, [indiceAtual, passo, abaAtiva, listaPerguntas]);

  // Regra matemática infalível baseada na tua indicação
  //const maratonaTerminou = quizzesEsgotados || (totalPerguntasBanco > 0 && respostasEscolhidas.length >= totalPerguntasBanco);
  //const maratonaTerminou = totalPerguntasBanco > 0 && respostasEscolhidas.length >= totalPerguntasBanco;
  // Força o JavaScript a comparar Número com Número de forma estrita
  const totalAtivas = Number(totalPerguntasBanco);
  const totalRespondidas = Number(respostasEscolhidas.length);

  //const maratonaTerminou = totalAtivas > 0 && totalRespondidas >= totalAtivas;
  // Garante a comparação absoluta de números inteiros
  //const maratonaTerminou = quizzesEsgotados || (Number(totalPerguntasBanco) > 0 && Number(respostasEscolhidas.length) >= Number(totalPerguntasBanco));
  // Regra matemática pura e direta solicitada
  const maratonaTerminou = totalPerguntasBanco > 0 && Number(respostasEscolhidas.length) >= Number(totalPerguntasBanco);

  return (
    <div id="app-layout">
      {/* Menu Superior */}
      <nav className="menu-navegacao" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            className={`nav-link ${abaAtiva === 'client' ? 'ativo' : ''}`}
            onClick={() => setAbaAtiva('client')}
          >
            📋 Quiz
          </button>

          {abaAtiva === 'client' && passo === 'perguntas' && designacaoAtual && (
            <span style={{ padding: '4px 12px', borderRadius: '15px', backgroundColor: '#ede9fe', color: '#7c3aed', fontSize: '0.85rem', fontWeight: '600' }}>
              🎯 Tema: {designacaoAtual}
            </span>
          )}
        </div>

        <button
          className={`nav-link ${abaAtiva === 'admin' ? 'ativo' : ''}`}
          onClick={() => setAbaAtiva('admin')}
        >
          🔐 Ranking
        </button>
      </nav>

      <header
        className="cabecalho"
        style={imagemFundo ? {
          backgroundImage: `linear-gradient(135deg, rgba(109, 40, 217, 0.65) 0%, rgba(124, 58, 237, 0.65) 50%, rgba(236, 72, 153, 0.65) 100%), url('${imagemFundo}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background 0.4s ease-in-out'
        } : {}}
      >
        <h1>{abaAtiva === 'client' ? 'Quiz cultural' : 'Ranking de pontuações'}</h1>
        <p>{abaAtiva === 'client' ? 'Desafia-te com perguntas sobre cultura geral' : 'Os melhores estão aqui'}</p>
      </header>

      <main className="conteudo">
        {abaAtiva === 'client' && (
          <div className="cartao-container">

            {/* BOAS-VINDAS */}
            {passo === 'welcome' && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '14px' }}>Bem-vindo ao Quiz cultural</h2>
                <p style={{ color: 'var(--secundario)', marginBottom: '24px' }}>
                  Responde a blocos de perguntas dinâmicas e acumula o máximo de pontos que conseguires!
                </p>
                <button className="btn-principal" onClick={() => setPasso('perguntas')}>
                  Começar Quiz
                </button>
              </div>
            )}

            {/* PERGUNTAS DINÂMICAS */}
            {passo === 'perguntas' && listaPerguntas.length > 0 && (
              <div key={listaPerguntas[indiceAtual]?.id_perg} className="area-pergunta">

                {/* BARRA DE PROGRESSO RESTAURADA */}
                <div className="progresso-bar">
                  <div className="progresso-feito" style={{ width: `${percentagemProgresso}%` }}></div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--secundario)', marginBottom: '8px' }}>
                  Questão {indiceAtual + 1} de {listaPerguntas.length} (Total respondidas: {respostasEscolhidas.length})
                </p>

                <h2 className="titulo-pergunta">{listaPerguntas[indiceAtual].descricao}</h2>

                <div className="lista-opcoes">
                  {listaPerguntas[indiceAtual].opcoes && listaPerguntas[indiceAtual].opcoes.map((opcao) => (
                    <button
                      key={`${listaPerguntas[indiceAtual].id_perg}-${opcao.id_resp}`}
                      className="opcao-btn"
                      onClick={() => selecionarOpcao(listaPerguntas[indiceAtual].id_perg, opcao.id_resp, opcao.valor)}
                    >
                      {opcao.texto_resposta}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* INTERMEDIÁRIO: SUBMETER OU CONTINUAR MARATONA */}
            {passo === 'tempo_acabou' && (
              <form onSubmit={submeterDadosFinais}>
                <h2 style={{ marginBottom: '10px' }}>Bloco Concluído!</h2>
                <p style={{ color: 'var(--secundario)', marginBottom: '20px' }}>
                  Respondeste a {respostasEscolhidas.length} de {totalPerguntasBanco || '...'} perguntas disponíveis nesta maratona.
                </p>

                <div className="formulario-grupo" style={{ marginBottom: '20px' }}>
                  <input type="text" name="nome" placeholder="Teu Nome" required={formData.autoriza_contacto === 'Y'} onChange={handleInputChange} value={formData.nome} />
                  <input type="email" name="email" placeholder="Teu E-mail" required={formData.autoriza_contacto === 'Y'} onChange={handleInputChange} value={formData.email} />
                  <input type="tel" name="telefone" placeholder="Teu Telefone" required={formData.autoriza_contacto === 'Y'} onChange={handleInputChange} value={formData.telefone} />

                  <div className="checkbox-grupo">
                    <input type="checkbox" checked={formData.autoriza_contacto === 'Y'} name="autoriza_contacto" id="autoriza" onChange={handleInputChange} />
                    <label htmlFor="autoriza">Quero entrar no ranking global com esta pontuação</label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button type="submit" className="btn-principal">
                    💾 Submeter e Salvar Resultados
                  </button>

                  <button
                    type="button"
                    className="opcao-btn"
                    disabled={maratonaTerminou} // 🔥 Inativa nativamente no HTML do browser
                    style={{
                      backgroundColor: maratonaTerminou ? '#9ca3af' : '#10b981',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '600',
                      cursor: maratonaTerminou ? 'not-allowed' : 'pointer',
                      opacity: maratonaTerminou ? 0.6 : 1
                    }}
                    onClick={async () => {
                      // Salvaguarda imediata para evitar execuções paralelas assíncronas
                      if (maratonaTerminou) return;

                      const temMaisPerguntas = await carregarPerguntas(quizzesJogados, true);
                      if (temMaisPerguntas) {
                        setPasso('perguntas');
                      }
                    }}
                  >
                    {maratonaTerminou
                      ? '🛑 Não há mais perguntas (Alcançaste o limite do Quiz)'
                      : '🔥 Continuar a Jogar (... e acumular pontos)'}
                  </button>

                  {maratonaTerminou && (
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', marginTop: '10px' }}>
                      <p style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center', margin: 0 }}>
                        🚫 Todos os blocos e perguntas ativos na base de dados ({totalPerguntasBanco}) foram respondidos! Submete o formulário para registar a tua pontuação.
                      </p>
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* SUCESSO FINAL */}
            {passo === 'fim' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h2 style={{ marginTop: '14px', color: 'var(--primaria)' }}>Fim da Maratona!</h2>
                <p style={{ color: 'var(--secundario)', marginTop: '10px', marginBottom: '24px' }}>
                  Excelente! Registaste um total de <strong>{respostasEscolhidas.length} respostas</strong> nesta série!
                </p>
                <button
                  className="btn-principal"
                  onClick={() => {
                    setPasso('welcome');
                    carregarPerguntas([], false);
                  }}
                >
                  Jogar Novamente
                </button>
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD ADMINISTRATIVO */}
        {abaAtiva === 'admin' && (
          <div className="cartao-container">
            <h2>Leads e Utilizadores Cadastrados (MySQL)</h2>
            <button onClick={sincronizarDados}>🔄 Sincronizar</button>
            {carregandoAdmin && <p style={{ textAlign: 'center', padding: '20px' }}>A ler dados...</p>}
            {errorAdmin && <p style={{ color: 'var(--erro)', textAlign: 'center' }}>Erro: {errorAdmin}</p>}
            {!carregandoAdmin && !errorAdmin && usuariosAdmin.length === 0 && <p style={{ textAlign: 'center', padding: '20px' }}>Nenhuma lead registada.</p>}
            {!carregandoAdmin && !errorAdmin && usuariosAdmin.length > 0 && (
              <table>
                <thead>
                  <tr>
                    {/* <th>ID</th> */}
                    <th>Nome</th>
                    <th>Contactos</th>
                    <th>Melhor Quiz</th>
                    <th>Pontuação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosAdmin.map((user) => (

                    // 🔥 CORREÇÃO: Usar id_serie como key única para permitir o mesmo utilizador várias vezes
                    <tr key={user.id_serie}>
                      {/* <td data-label="ID">{user.id_user}</td> */}
                      <td data-label="Nome">{user.nome}</td>
                      <td data-label="Contactos">{user.email}<br />{user.telefone}</td>
                      <td data-label="Melhor Quiz"><span style={{ fontSize: '0.85rem', color: '#666' }}>{user.quiz_pontuacao_maxima}</span></td>
                      <td data-label="Pontuação"><span className="tag-pontuacao">{user.pontuacao_maxima} pts</span></td>
                      <td data-label="Ações">
                        <button className="btn-eliminar" onClick={() => {
                          console.log("ID Série:", user.id_serie, "ID User:", user.id_user);
                          eliminarUtilizador(user.id_serie, user.id_user);
                        }}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <footer style={{ backgroundColor: '#f4f4f4', padding: '15px 0', borderTop: '1px solid #e0e0e0', marginTop: '20px' }}>
        <div style={{ textAlign: 'center', color: 'var(--secundario, #666)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} Quiz Cultural Joao Tomasio.
        </div>
      </footer>
    </div>
  );
}

export default App;