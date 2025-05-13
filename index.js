const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); 
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require("path");


app.use(express.static(path.join(__dirname, 'public' )));

app.set('view', path.join(__dirname, 'public' ));

app.engine('html', ejs.renderFile);

app.use('/', (req, resp) => {
    resp.render('index.html');
});

function conectDB() {
    let dbURL = "mongodb+srv://David_Ramos:david123@cluster0.tnhlw.mongodb.net/"

    mongoose.connect(dbURL);

    mongoose.connection.on('error', console.error.bind(console, 'connection error: '));
    mongoose.connection.once('open', function() {
        console.log('ATLAS MONGODB CONECTADO COM SUCESSO!');
    });
}

conectDB();

let Message = mongoose.model('message', {usuario:String, data_hora:String, message:String});

/* ##### LÓGICA DO SOCKET.IO - ENVIO E PROPAGAÇÃO DE MENSAGENS ##### */

// ARRAY QUE SIMULA O BANCO DE DADOS
let messages = [];

Message.find({})
    .then(docs=>{
        messages = docs
    }).catch(error=>{
        console.log(error)
    });

/* ESTRUTURA DE CONEXÃO DO SOCKET.IO */
io.on('connection', socket=>{

    // Teste de conexão
    console.log('NOVO USUÁRIO CONECTADO: ' + socket.id);

    // Recupera e mantém (exibe) as mensagens entre o front e o back
    socket.emit('previousMessage', messages);

    // Lógica de chat quando uma mensagem é enviada:
    socket.on('sendMessage', data=>{

        // Adiciona a mensagem no final do array de mensagens:
        //messages.push(data);
        let message = new Message(data);

        message.save()
            .then(
                socket.broadcast.emit('recivedMessage', data)
            ).catch(error=>{
                console.log(error)
            });

        

        console.log("QTD MENSAGENS: " + messages.length);
    });

    console.log("QTD MENSAGENS: " + messages.length);
});

server.listen(3000, ()=>{console.log("CHAT RODANDO EM - http://localhost:3000")});