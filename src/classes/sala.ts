import { CrearSalaArgs } from "../interfaces/crearSala";
import { JUGADOR_VACIO, Jugador } from "../interfaces/jugador";

export class Sala {
  publica: boolean;
  jugadores: [Jugador,Jugador] = [{...JUGADOR_VACIO},{...JUGADOR_VACIO}];
  id: number

  constructor(args:CrearSalaArgs){
    this.publica = args.publica
  }

  agregarJugador(nombre: string){
    const indiceJugador = !this.jugadores[0].nombre ? 0 : 1;
    this.jugadores[indiceJugador].nombre = nombre;
    this.jugadores[indiceJugador].vidas = 3;
  }

  getSala(){
    return {
      publica : this.publica,
      jugadores : this.jugadores,
      id : this.id
    }
  }


}