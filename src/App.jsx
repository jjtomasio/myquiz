import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('client');
  // Estado para verificar a ligação e o status da API
  const [statusAPI, setStatusAPI] = useState('A verificar ligação...');
  // Estados do Fluxo do Cliente
  const [passo, setPasso] = useState('welcome');
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

  // Estados extra para alteração de Email em linha
  const [editandoUserId, setEditandoUserId] = useState(null);
  const [novoEmailInput, setNovoEmailInput] = useState('');

  useEffect(() => {
    // Verifica se a API está online e pronta
    fetch(`${API_URL}/status`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setStatusAPI(data.message); // Define a mensagem: "O quiz está pronto a ser iniciado!"
        } else {
          setStatusAPI('Servidor online, mas com resposta inesperada.');
        }
      })
      .catch(err => {
        console.error("Erro na ligação à API:", err);
        setStatusAPI('Sem ligação ao servidor do Quiz.');
      });

    // consulta para carregamento inicial
    fetch(`${API_URL}/total_perguntas_ativas`)
      .then(res => res.json())
      .then(data => {
        if (data && data.total) {
          setTotalPerguntasBanco(Number(data.total));
        }
      })
      .catch(err => console.error("Erro ao buscar total:", err));

    carregarPerguntas();
  }, []);

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

  const alterarEmail = async (id_user, emailAtual) => {
    const emailFormatado = novoEmailInput.trim();

    if (!emailFormatado || emailFormatado === emailAtual) {
      alert('Por favor, introduza um e-mail diferente do e-mail atual.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailFormatado)) {
      alert('Por favor, introduza um endereço de e-mail válido (exemplo: nome@dominio.com).');
      return;
    }

    if (!window.confirm(`Tens a certeza que pretendes alterar o e-mail para "${emailFormatado}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/users/${id_user}/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailFormatado })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('E-mail updated com sucesso!');
        setUsuariosAdmin(usuariosAdmin.map(user => {
          if (user.id_user === id_user) {
            return { ...user, email: emailFormatado };
          }
          return user;
        }));
        setEditandoUserId(null);
        setNovoEmailInput('');
      } else {
        alert(`Erro: ${data.error || 'Não foi possível atualizar o e-mail.'}`);
      }
    } catch (err) {
      alert('Erro na ligação ao servidor.');
    }
  };

  const eliminarUtilizador = async (id_serie, id_user) => {
    if (!window.confirm('Pretendes eliminar esta tentativa de jogo permanentemente?')) return;
    try {
      const res = await fetch(`${API_URL}/series/${id_serie}?id_user=${id_user}`, {
        method: 'DELETE'
      });

      if (res.ok) {
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

  const carregarPerguntas = async (historicoAtual = quizzesJogados, manterPontos = false) => {
    setListaPerguntas([]);
    setIndiceAtual(0);

    if (!manterPontos) {
      setRespostasEscolhidas([]);
      setQuizzesJogados([]);
      setQuizzesEsgotados(false);
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

  const percentagemProgresso = totalPerguntasBanco > 0
    ? ((respostasEscolhidas.length / totalPerguntasBanco) * 100)
    : 0;
  /*
    useEffect(() => {
      if (abaAtiva === 'client' && passo === 'perguntas' && listaPerguntas.length > 0 && listaPerguntas[indiceAtual]) {
        const temaAtual = listaPerguntas[indiceAtual].tema || 'culture';
        //const novaImagem = `https://loremflickr.com/1280/720/${encodeURIComponent(temaAtual)}?lock=${indiceAtual}`;
        const novaImagem = `https://loremflickr.com/1280/720/${encodeURIComponent(temaAtual)}?lock=${indiceAtual}`;
        setImagemFundo(novaImagem);
      } else {
        setImagemFundo(null);
      }
    }, [indiceAtual, passo, abaAtiva, listaPerguntas]);*/
  useEffect(() => {
    let urlImagemCriada = null;
    const obterImagemDeFundo = async (tema) => {

      const apiKey = import.meta.env.VITE_API_NINJAS_KEY
      const url = `https://api.api-ninjas.com/v1/randomimage`;
      if (!apiKey) {
        console.warn("Aviso: VITE_API_NINJAS_KEY não está definida no ficheiro .env!");
        setImagemFundo(null); 
        return;
      }
      try {
        const resposta = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Api-Key': apiKey,
            'Accept': 'image/jpeg'
          }
        });

        if (!resposta.ok) {
          throw new Error(`Erro na API-Ninjas: ${resposta.status}`);
        }

        const imagemBlob = await resposta.blob();
        urlImagemCriada = URL.createObjectURL(imagemBlob);
        setImagemFundo(urlImagemCriada);

      } catch (erro) {
        console.error('Erro ao carregar imagem de fundo:', erro);
        setImagemFundo(null);
      }
    };

    if (abaAtiva === 'client' && passo === 'perguntas' && listaPerguntas.length > 0 && listaPerguntas[indiceAtual]) {
      const temaAtual = listaPerguntas[indiceAtual].tema || 'nature';
      obterImagemDeFundo(temaAtual);
    } else {
      setImagemFundo(null);
    }

    return () => {
      if (urlImagemCriada) {
        URL.revokeObjectURL(urlImagemCriada);
      }
    };
  }, [indiceAtual, passo, abaAtiva, listaPerguntas]);

  const maratonaTerminou = totalPerguntasBanco > 0 && Number(respostasEscolhidas.length) >= Number(totalPerguntasBanco);

  return (
    <div id="app-layout">
      <nav className="menu-navegacao">
        <div className="nav-container-esquerda">
          <button
            className={`nav-link ${abaAtiva === 'client' ? 'ativo' : ''}`}
            onClick={() => setAbaAtiva('client')}
          >
            📋 Quiz
          </button>

          {abaAtiva === 'client' && passo === 'perguntas' && designacaoAtual && (
            <span className="badge-tema">
              🎯 {designacaoAtual}
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
          backgroundImage: `linear-gradient(135deg, rgba(7, 73, 62, 0.65) 0%, rgba(54, 173, 157, 0.65) 50%, rgba(24, 66, 73, 0.65) 100%), url('${imagemFundo}')`
        } : {}}
      >
        <h1>{abaAtiva === 'client' ? 'Quiz cultura geral' : 'Ranking de pontuações'}</h1>
        <p>{abaAtiva === 'client' ? 'Desafia-te com perguntas sobre cultura geral' : 'Os melhores estão aqui'}</p>
      </header>

      <main className="conteudo">
        {abaAtiva === 'client' && (
          <div className="cartao-container">
            {passo === 'welcome' && (
              <div className="boas-vindas-container">
                <h2>Bem-vindo ao Quiz cultural</h2>
                <p>Responde a blocos de perguntas dinâmicas e acumula o máximo de pontos que conseguires!</p>

                {/* Mensagem dinâmica de verificação da API via classes CSS */}
                <div className={`status-api-alert ${statusAPI.includes('pronto') ? 'pronto' : 'erro'}`}>
                  📡 {statusAPI}
                </div>

                <br />

                <button
                  className="btn-principal"
                  onClick={() => setPasso('perguntas')}
                  disabled={!statusAPI.includes('pronto')}
                >
                  Iniciar Quiz
                </button>
              </div>
            )}

            {passo === 'perguntas' && listaPerguntas.length > 0 && (
              <div key={listaPerguntas[indiceAtual]?.id_perg} className="area-pergunta">
                <div className="progresso-bar">
                  <div className="progresso-feito" style={{ width: `${percentagemProgresso}%` }}></div>
                </div>
                <p className="status-pergunta-texto">
                  Questão {indiceAtual + 1} de {listaPerguntas.length} (Respondidas: {respostasEscolhidas.length})
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

            {passo === 'tempo_acabou' && (
              <form onSubmit={submeterDadosFinais}>
                <h2 className="bloco-concluido-titulo">Bloco Concluído!</h2>
                <p className="bloco-concluido-subtitulo">
                  Respondeste a {respostasEscolhidas.length} de {totalPerguntasBanco || '...'} perguntas.
                </p>

                <div className="formulario-grupo">
                  <input type="text" name="nome" placeholder="Teu Nome" required={formData.autoriza_contacto === 'Y'} onChange={handleInputChange} value={formData.nome} />
                  <input type="email" name="email" placeholder="Teu E-mail" required={formData.autoriza_contacto === 'Y'} onChange={handleInputChange} value={formData.email} />
                  <input type="tel" name="telefone" placeholder="Teu Telefone" required={formData.autoriza_contacto === 'Y'} onChange={handleInputChange} value={formData.telefone} />

                  <div className="checkbox-grupo">
                    <input type="checkbox" checked={formData.autoriza_contacto === 'Y'} name="autoriza_contacto" id="autoriza" onChange={handleInputChange} />
                    <label htmlFor="autoriza">Quero entrar no ranking global com esta pontuação</label>
                  </div>
                </div>

                <div className="acoes-submissao-grupo">
                  <button type="submit" className="btn-principal">
                    💾 Submeter e Salvar Resultados
                  </button>

                  <button
                    type="button"
                    className="opcao-btn btn-continuar-maratona"
                    disabled={maratonaTerminou}
                    onClick={async () => {
                      if (maratonaTerminou) return;
                      const temMaisPerguntas = await carregarPerguntas(quizzesJogados, true);
                      if (temMaisPerguntas) setPasso('perguntas');
                    }}
                  >
                    {maratonaTerminou ? '🛑 Maratona Concluída' : '🔥 Continuar a Jogar'}
                  </button>
                </div>
              </form>
            )}

            {passo === 'fim' && (
              <div className="fim-maratona-container">
                <span>🎉</span>
                <h2>Fim da Maratona!</h2>
                <p>Registaste um total de <strong>{respostasEscolhidas.length} respostas</strong>!</p>
                <button className="btn-principal" onClick={() => { setPasso('welcome'); carregarPerguntas([], false); }}>
                  Jogar Novamente
                </button>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'admin' && (
          <div className="cartao-container">
            <div className="admin-header">
              <h2>Best players</h2>
              <button className="btn-atualizar" onClick={sincronizarDados}>🔄 Sincronizar</button>
            </div>

            {carregandoAdmin && <p className="tabela-alerta-feedback">A ler dados...</p>}
            {errorAdmin && <p className="tabela-alerta-feedback erro">Erro: {errorAdmin}</p>}
            {!carregandoAdmin && !errorAdmin && usuariosAdmin.length === 0 && <p className="tabela-alerta-feedback">Nenhuma pontuação registada.</p>}

            {!carregandoAdmin && !errorAdmin && usuariosAdmin.length > 0 && (
              <div className="tabela-responsiva">
                <table className="tabela-admin">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Contactos</th>
                      <th>Melhor Quiz</th>
                      <th>Pontuação</th>
                      <th>{editandoUserId ? 'Alterar Email' : 'Ações'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosAdmin.map((user) => (
                      <tr key={user.id_serie}>
                        <td data-label="Nome">{user.nome}</td>
                        <td data-label="Contactos">
                          <span className="email-texto">{user.email}</span>
                          <br />
                          <span className="telefone-texto">{user.telefone}</span>
                        </td>
                        <td data-label="Melhor Quiz">{user.quiz_pontuacao_maxima}</td>
                        <td data-label="Pontuação"><span className="tag-pontuacao">{user.pontuacao_maxima} pts</span></td>
                        <td data-label={editandoUserId === user.id_user ? "Alterar Email" : "Ações"}>
                          <div className="acoes-container">
                            {editandoUserId === user.id_user ? (
                              <div className="wrapper-edicao">
                                <input
                                  type="email"
                                  className="input-alterar-email"
                                  placeholder="Novo e-mail"
                                  value={novoEmailInput}
                                  onChange={(e) => setNovoEmailInput(e.target.value)}
                                />
                                <div className="botoes-edicao-grupo">
                                  <button
                                    className="btn-gravar"
                                    onClick={() => alterarEmail(user.id_user, user.email)}
                                  >
                                    Gravar
                                  </button>
                                  <button
                                    className="btn-cancelar"
                                    onClick={() => { setEditandoUserId(null); setNovoEmailInput(''); }}
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="btn-alterar"
                                  onClick={() => {
                                    setEditandoUserId(user.id_user);
                                    setNovoEmailInput(user.email);
                                  }}
                                >
                                  Alterar Email
                                </button>
                                <button className="btn-eliminar" onClick={() => eliminarUtilizador(user.id_serie, user.id_user)}>
                                  Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="rodape-global">
        <div className="rodape-conteudo">
          © {new Date().getFullYear()} Quiz cultura geral Joao Tomásio
        </div>
      </footer>
    </div>
  );
}

export default App;