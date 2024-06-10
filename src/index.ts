import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server,{cors:{origin:"*"}});

server.listen(3000, ()=> {
  console.log("Server escuchando en el puerto 3000");
})

io.on("connection",(socket)=>{
  console.log("Nueva conexión")
  socket.emit("mensaje desde el back")
  socket.on("Mensaje custom",()=> console.log("Recibí un mensaje custom"))
})