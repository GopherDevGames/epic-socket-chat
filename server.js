import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { exec } from 'node:child_process';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

let users = {}

let messages = []

let connected_sockets = []

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, req.originalUrl));
});


server.listen(8872, () => {
  console.log('server running at http://localhost:8872');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    connected_sockets.push(socket)

    socket.on("SET_NICKNAME", (arg) => {
        users[socket.id] = {}
        if (!is_nickname_valid(arg)){
            send_error(socket,"WRONG_NICKNAME")
            return
        }
        users[socket.id]["nickname"] = arg;
        console.log('user\'s nickname: ' + arg);
    });

    socket.on("SEND_MESSAGE", (arg) => {
        if (!is_socket_valid(socket)){
            return
        }
        let message = [users[socket.id]["nickname"],arg]
        send_to_all(message, true)
    });
    socket.on("SEND_IMAGE", (arg) => {
        if (!is_socket_valid(socket)){
            return
        }
        let message = [users[socket.id]["nickname"],arg]
        message[1] = "!!?@!FORCEIMG" + message[1]
        send_to_all(message, true)
    });
    socket.on("SEND_PEDNING_MESSAGES", (arg) =>{
        for (let index = 0; index < messages.length; index++) {
            const msg = messages[index];
            send_to_socket(socket, msg)
        }
    })

    socket.on('disconnect', () => {
        connected_sockets.splice(connected_sockets.indexOf(socket.id),1)
        if (!is_socket_valid(socket, true)){
            return
        }
        console.log('user ' + users[socket.id]["nickname"] +" disconnected");
        
      });

  });

function send_to_all(message, do_push = false){
    for (let index = 0; index < connected_sockets.length; index++) {
        const element = connected_sockets[index];
        send_to_socket(element, message, false)
        
    }
    if (do_push){
        messages.push(message)
    }
}

function send_to_socket(socket, message, do_push = false){
    if (!is_socket_valid(socket)){
        return
    }
    socket.emit("ADD_MESSAGE",message)
    if (do_push){
        messages.push(message)
    }
}

function is_socket_valid(socket, include_disconnect = true){
    if (socket.disconnected && include_disconnect){
        //console.log("User is disconnected...")
        return false
    }
    if (users[socket.id] == undefined){
        //console.log("User is undefined...")
        return false
    }
    if (!users[socket.id].hasOwnProperty("nickname")){
        //console.log("User doesn't have a nickname...")
        return false
    }
    return true
}

function is_nickname_valid(nickname){

    //return true

    if (nickname == null){
        return false
    }
    if (nickname.length < 3){
        return false
    }
    if (nickname.length > 32){
        return false
    }
    return true
}

function send_error(socket,error){
    socket.emit("SHOW_ERROR",error)
}

const update_display = async () => {
    while (true){
    await delay(200);
    console.clear()
    console.log("Czas Działania: " + ((((Date.now()-time_started)/1000)/60)/60).toFixed(3) + "h")
    console.log("Połączeni użytkownicy: " + connected_sockets.length)
    for (let index = 0; index < connected_sockets.length; index++) {
        const socket = connected_sockets[index];
        if (is_socket_valid(socket,true)){
            console.log("    ◉ " + users[socket.id]["nickname"])
        }
    }
    console.log("Liczba wiadomości: " + messages.length)
  };
}
const time_started = Date.now()
update_display()











function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

/*
import express from 'express';

const app = express();

import { Server } from "socket.io";


const io = new Server(8872);


let clients = {}
let sockets = []

app.get('/', (req, res) => {
    console.log(req+" "+res)
  res.sendFile('/home/gopher/Desktop/socket-io-czat-ale-html/vue-socket-chat/server.js');
});

io.on("connection", (socket) =>
{
    socket.on("SET_NICKNAME", (arg) =>{

        console.log(`New User! ${arg}`)

        SendToAll(`New User Joined! ${arg}`);

        clients[socket.id] = {}
        clients[socket.id]["nickname"] = arg;
        sockets.push(socket);

    });
    

    socket.on("NEW_MSG", (arg) =>{
        console.log(`New Message! ${arg}`);
        SendToAll(`${clients[socket.id]["nickname"]}: ${arg}`);
    });

    socket.on('disconnect',(arg) =>{
        SendToAll(`${clients[socket.id]["nickname"]} has left!  Reason: ${arg}`)
    })
});

function SendToAll(text){
    sockets.forEach(client => {
        client.emit("ADD_MSG",`${text}`);
    });
}
*/