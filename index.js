const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); 
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const ejs = require('ejs');
const path = require("path");


app.use(express.static(path.join(__dirname, 'public' )));

app.set('view', path.join(__dirname, 'public' ));

app.engine('html', ejs.renderFile);

app.use('/', (req, resp) => {
    resp.render('index.html');
});

/* ##### LÓGICA DO SOCKET.IO - ENVIO E PROPAGAÇÃO DE MENSAGENS ##### */

// ARRAY QUE SIMULA O BANCO DE DADOS
let messages = [];

/* ESTRUTURA DE CONEXÃO DO SOCKET.IO */
io.on('connection', socket=>{

    // Teste de conexão
    console.log('NOVO USUÁRIO CONECTADO: ' + socket.id);

    // Recupera e mantém (exibe) as mensagens entre o front e o back
    socket.emit('previousMessage', messages);

    // Lógica de chat quando uma mensagem é enviada:
    socket.on('sendMessage', data=>{

        // Adiciona a mensagem no final do array de mensagens:
        messages.push(data);

        socket.broadcast.emit('recivedMessage', data);
    });
});

server.listen(3000, ()=>{console.log("CHAT RODANDO EM - http://localhost:3000")});