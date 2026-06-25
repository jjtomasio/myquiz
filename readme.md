# 🎯 MyQuiz

> Aplicação Full-Stack de Quiz de Cultura Geral com perguntas aleatórias e registo de classificações.

---

## 🎯 Objetivo da Aplicação
Demonstrar competências Full-Stack através do desenvolvimento de uma API REST, comunicação Frontend-Backend, operações CRUD numa base de dados MySQL e gestão de estado com React.

---

## 🛠️ Tecnologias Usadas
* **Frontend:** Interface do utilizador (`React`) | 
                Ambiente de desenvolvimento (`Vite`)|
                Lógica da aplicação (`JavaScript ES6+ `)|
                Estilização e responsividade (`CSS3`)|
* **Backend:**  Runtime JavaScript (`Node.js`), API REST (`Express.js`)
* **Base de Dados:** MySQL (`mysql2`) | persistencia de dados com Ligação assíncrona à BD |
* **Dependências:** `cors`, `dotenv`, `nodemon`

---
 

## 📦 Instalar Dependências
```powershell
npm install
```

## 💾 Importar a Base de Dados
Importe o ficheiro `myquiz_db.sql` através do terminal bash ou da interface Workbench

* **Opção 1:**
* **Windows**
  ```powershell
  # Caso o comando 'mysql' esteja nas variáveis de ambiente:
  mysql -u root -p < myquiz_db.sql
  # Caso precise de indicar o caminho padrão do MySQL Server:
  /c/Program\ Files/MySQL/MySQL\ Server\ 8.0/bin/mysql -u root -p < myquiz_db.sql
  ```
  

  
* **LINUX Ubuntu, Debian, Mint ou Pop!_OS**
```bash
# este readme foi feito para Windows, no entanto os utilizadores Linux ou Mac podem fazer o seguinte

# Certifique-se de que o MySQL está ativo no sistema; se necessário, abra o terminal e digite

sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS myquiz_db;"
sudo mysql -u root myquiz_db < myquiz_db.sql
```

* **MAC_OS**
```bash
# Assegure-se que o serviço local está activo no Mac. Se necessário execute os seguintes comandos

# 1. Instalar e iniciar o servidor MySQL (caso não tenha)
brew install mysql
brew services start mysql

# 2. Criar a base de dados e importar
mysql -u root -e "CREATE DATABASE IF NOT EXISTS myquiz_db;"
mysql -u root -p myquiz_db < myquiz_db.sql
```    

* **Opção 2 (interface MySQL/workbench):** importe o ficheiro `myquiz_db.sql` na sua ferramenta de gestão de BD (ex: phpMyAdmin, Workbench) e execute.

---

## ⚙️  Configurar o `.env`
Renomeie o ficheiro `.env.example` para `.env` na raiz do projeto e configure com as suas credenciais MySQL:

```env
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3306
DATABASE_USER="root"
DATABASE_PASSWORD="A_SUA_SENHA_MYSQL"
DATABASE_NAME="myquiz_db"

VITE_API_NINJAS_KEY= a-sua-chave-API-aqui
# Chave de API para o gerador de imagens de fundo (API-Ninjas)
# Podes obter uma chave gratuita em: https://api-ninjas.com/
# ou usar temporariamente a seguinte chave de teste qdJHah6uF2eUOEfY86Jcq2gCu1v7Zj3m5zAhYYF8
```


---
## 🌐 Rotas API (Explicação Rápida)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Verifica se a API está online e disponível. |
| `GET` | `/api/total_perguntas_ativas` | Retorna o total de perguntas registadas na BD. |
| `GET` | `/api/init_jogo` | Obtém perguntas e respostas aleatórias para o quiz. |
| `GET` | `/api/users` | Retorna a lista completa de utilizadores registados. |
| `POST` | `/api/submeter` | Grava a pontuação final e os dados do utilizador no ranking. |
| `DELETE` | `/api/series/:id_serie` | Remove permanentemente um registo através do ID da série. |
| `PUT` | `/api/users/:id_user/email` | Atualiza o endereço de email de um utilizador específico. |

---

## 🌐 Correr o Backend ###############################
```powershell
npm run server
```

## 🌐 Correr o Frontend ###############################
<!--Abra um **segundo** terminal PowerShell e execute-->
```powershell
npm run dev
```

## 🌐 Correr a aplicaçao ###############################

Abra o browser e navegar para `http://localhost:5173`


## 🕹️ Exemplos Simples de Utilização

### Exemplo 1: Responder ao Quiz
1. Em `http://localhost:5173` clique **Iniciar Quiz**.
2. Responda às 5 perguntas da ronda selecionando uma das 4 opções.
3. No final da ronda, escreva o seu nome e submeta para guardar o seu resultado no **Ranking**.

### Exemplo 2: Gerir o Ranking (Administração)
1. Aceda ao separador **Ranking** no menu do Frontend para consultar a tabela de classificações.
2. Clique no botão Alterar email junto a um registo para editar esse campo (aciona a rota `PUT`).  Clique Gravar para submeter alteraçoes; Clique 2 ok para confirmar
3. Clique no botão de eliminar junto a um registo para remover essa pontuação (aciona a rota `DELETE`). Clique OK para confirmar ou Cancelar para anular açao.

---

## 👨‍💻 Autor
**João Tomásio** - jjtomasio@gmail.com - Projeto Formativo V2767|U03814 (2026)