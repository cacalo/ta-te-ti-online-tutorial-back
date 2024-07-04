import { Socket } from "socket.io";
import { CrearSalaArgs } from "../interfaces/crearSala";
import { JUGADOR_VACIO, Jugador } from "../interfaces/jugador";
import { EstadoJuego, POSICION_TABLERO, SalaBackend, Tablero } from "../interfaces/sala";

export class Sala {
  publica: boolean;
  jugadores: [Jugador,Jugador] = [{...JUGADOR_VACIO},{...JUGADOR_VACIO}];
  id: number
  socket: Socket
  jugadorInicial: 0|1 = 0;
  tablero:Tablero= ["","","","","","","","","",]

  estado: EstadoJuego = "ESPERANDO_COMPAÑERO";

  constructor(args:CrearSalaArgs, socket:Socket){
    this.publica = args.publica;
    this.socket = socket;
  }

  agregarJugador(nombre: string){
    const indiceJugador = !this.jugadores[0].nombre ? 0 : 1;
    this.jugadores[indiceJugador].nombre = nombre;
    this.jugadores[indiceJugador].vidas = 3;
    if(this.jugadores[1].nombre) {
      this.estado = this.jugadorInicial === 0 ? "TURNO_P1" : "TURNO_P2";
      this.jugadorInicial = this.jugadorInicial === 0 ? 1 : 0;
    }
    this.comunicarSala();
  }

  getSala():SalaBackend{
    return {
      publica : this.publica,
      jugadores : this.jugadores,
      id : this.id,
      estado: this.estado,
      tablero: this.tablero
    }
  }

  /** Comunica el estado actual de la sala a todos sus integrantes */
  comunicarSala(){
    global.io.to("sala-"+this.id).emit("sala",this.getSala())
  }

  jugadorAbandono(){
    this.estado = "ABANDONADO";
    this.comunicarSala();
  }

  jugar(numeroJugador:1|2,posicion:POSICION_TABLERO){
    if((numeroJugador !== 1 && this.estado === "TURNO_P1") ||  
      (numeroJugador !== 2 && this.estado === "TURNO_P2")) return;
    this.tablero[posicion] = numeroJugador;
    this.estado = this.estado === "TURNO_P1" ? "TURNO_P2" : "TURNO_P1";
    this.comunicarSala();
  }

}