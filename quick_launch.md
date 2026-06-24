# INSTALAÇAO RAPIDA
*Este ficheiro contem instruçoes para uma instalaçao rápida do projecto*
*nao dispensa a leitura do README.MD do projecto, que contem informaçao mais completa*

*##############################################*
*-                     ___                   -*
*-                    |__                    -*
*-       SIGA ESTES   __|   PASSOS           -*
*-                                           -*
*-                                           -*
*##############################################*

# PASSO 1 ##################################################
# 1 Clonar repositório
git clone --depth 1 https://github.com/jjtomasio/myquiz.git

# PASSO 2 ##################################################
# instalar dependencias
*abra um terminal no VS code*
*navegue para a pasta do projecto*
cd myquiz
*DIGITE ESTES COMANDOS*

npm install *instala os pacotes com dependencias configuradas em package.jsons*

# PASSO 3 ##################################################
# 3 Criar base de dados
mysql -u root -p < myquiz_db.sql
*Nota: O terminal vai pedir a sua palavra-passe de seguida. O comando '<' injeta todo o conteúdo do ficheiro diretamente no MySQL.*

*se nao tem MYSQL instalado, ou o terminal do VS Code nao sabe onde ele está, execute estes comandos no BASH*
   *WINDOWS*
        /c/Program\ Files/MySQL/MySQL\ Server\ 8.0/bin/mysql -u root -p < myquiz_db.sql
   *LINUX Ubuntu, Debian, Mint ou Pop!_OS*
        sudo apt update
        sudo apt install mysql-client -y
    *LINUX Fedora, RHEL ou CentOS*
        sudo dnf install mysql -y

   *MAC*
        /opt/homebrew/bin/mysql -u root -p < myquiz_db.sql
    *REPETIR NOVAMENTE APENAS NO LINUX OU MAC*    
        mysql -u root -p < myquiz_db.sql

*Verifique se a base de dados foi criada com as tabelas:*
*init_jogo, perguntas, respostas, resultado_serie, serie e user*    



# PASSO 4 ##################################################
# edite o ficheiro .env.example
*altere o nome do ficheiro para .env*
*coloque a sua password MYSQL no campo DATABASE_PASSWORD="a sua senha mysql"*
*edite os campos HOST, PORT ou USER para os valores da sua configuraçao MYSQL*
*grave e feche o ficheiro*


# PASSO 5 ##################################################
# INICIAR SERVIDOR
*abra 2 terminais powershell no VS code e digite*

*no terminal 1* 
npm run dev

*no terminal 2*
npm run server

*o terminal 1 deve ficar com o servidor de desenvolvimento do Vite activo na porta 5173 - VITE v5.4.xx  ready in xxx ms*
*o terminal 2 deve ficar com Servidor de API ativo na porta 3000 e Ligação ao MySQL estabelecida com sucesso!*
*NAO FECHE ESTES TERMINAIS enquanto quiser correr a aplicaçao*

# PASSO 6 ##################################################
# CORRER A APLICAÇAO
*Para abrir o seu projeto abra o seu navegador de internet e digite* 
localhost:5173

# OBSERVAÇOES:
*se algo falhar, siga os passos nas instruçoes do ficheiro README.MD