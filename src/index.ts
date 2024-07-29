import express from 'express';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import { Sala } from './classes/sala';
import { CrearSalaArgs, UnirseASalaArgs } from './interfaces/crearSala';
import { config } from 'dotenv';

const app = express();
const server = createServer(app);
const io = new Server(server,{cors:{origin:"*"}});
global.io = io;
config();

const puerto = process.env.PORT || 3000;
server.listen(puerto, ()=> {
  console.log("Server escuchando en el puerto", puerto);
})

let salas:Sala[] = [];
let idProximaSala = 0;

io.on("connection",(socket)=>{
  //console.log("Nueva conexión");
  socket.on("encontrarSala",(callback) => buscarSalaPublica(callback));
  socket.on("crearSala",(args,callback) => crearSala(socket,callback,args ))
  socket.on("unirseASala",(args,callback) => unirseASala(socket,callback,args));
  socket.on("disconnecting",()=> {
    if(socket.rooms.size < 2) return;
    const salaJugador = salas.find(sala => sala.id == parseInt([...socket.rooms][1].substring(5)))
    if(!salaJugador) return;
    salaJugador?.jugadorAbandono();
    socket.conn.close();
    salas = salas.filter(sala => sala.id !== salaJugador.id);
    //console.log("Acabo de cerrar la sala",salaJugador.id,", ahora las salas son",salas)
  });
  socket.on("jugar",(args)=> {
    //console.log("Viendo de registrar una jugada",args, buscarSala(args.salaId))
    buscarSala(args.salaId)?.jugar(args.jugador,args.posicion)
  })

  socket.on("nuevaRonda",(args)=> {
    //console.log("Viendo de empezar una nueva ronda",args, buscarSala(args.salaId))
    buscarSala(args.salaId)?.nuevaRonda();
  })

})

/** Busca una sala disponible, si la encuentra devuelve el id de la sala, y sino devuelve null */
function buscarSalaPublica(callback: Function){
  //console.log("Buscando sala pública")
  const salaDisponible = salas.find(sala => {
    if(!sala.publica) return false;
    if(sala.jugadores[0].nombre && sala.jugadores[1].nombre) return false;
    return true
  })
  callback(salaDisponible ? salaDisponible.id : null);
}

function crearSala(socket:Socket, callback: Function, args: CrearSalaArgs){
  const nuevaSala = new Sala(args)
  nuevaSala.id = idProximaSala;
  idProximaSala++;
  salas.push(nuevaSala);
  unirseASala(socket,callback,{
    id: nuevaSala.id,
    nombreJugador: args.nombreJugador
  })
}

/** Une a un jugador a una sala */
function unirseASala(socket:Socket,callback:Function, args:UnirseASalaArgs){
  //console.log("Uniendo a sala",args)
  if(!salas.length) return callback({exito: false, mensaje: "No existen salas"});
  const salaIndex = salas.findIndex(sala => sala.id === args.id);
  if(salaIndex === -1) return callback({exito: false, mensaje: "No existe la sala con ID " + args.id});
  if(salas[salaIndex].jugadores[0].nombre && salas[salaIndex].jugadores[1].nombre) return callback(
    {exito: false, mensaje: "La sala está llena"}
  );
  salas[salaIndex].agregarJugador(args.nombreJugador);
  socket.join("sala-"+salas[salaIndex].id);
  return callback({exito:true, mensaje: "Unido a la sala "+salas[salaIndex].id, sala: salas[salaIndex].getSala()})
}

function buscarSala(id:number) {
  return salas.find(sala => sala.id === id)
}