const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server,{
    cors:{
        origin: '*'
    }
});
const port = 3000;

io.on('connection',(socket)=>{
    socket.on('join-room',(roomId,userId)=>{
        console.log(roomId,userId)
        socket.join(roomId);
        socket.to(roomId).emit('same-room-user',userId);
        socket.on('disconnect',()=>{
            socket.to(roomId).emit('user-disconnected',userId);
        })
    })
})

server.listen(port)