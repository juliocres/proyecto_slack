/*
SERVICES: capa de logica de negocio.

Los services NO conocen HTTP (no reciben request/response): reciben datos
planos, aplican las reglas de negocio (validaciones, verificaciones) y se
comunican con los repositories para acceder a la DB.
*/

import channel_repository from "../repositories/channel.repository.js"
import ServerError from "../utils/error.util.js"

/*
Obtener la lista de canales de un espacio de trabajo:
    - valida que el workspace_id venga
    - trae todos los canales que pertenecen a ese workspace
*/
export async function getChannelsByWorkspace(workspace_id){

    if(!workspace_id){
        throw new ServerError('El workspace_id es requerido', 400)
    }

    const channels = await channel_repository.getAllChannelsByWorkpaceId(workspace_id)

    return channels
}

/*
Obtener un canal especifico de un espacio de trabajo:
    - valida que el channel_id venga
    - busca el canal, valida que exista
    - valida que el canal pertenezca al workspace de la URL
      (si no pertenece, responde 404 para no revelar la existencia del canal)
*/
export async function getChannelById(workspace_id, channel_id){

    if(!channel_id){
        throw new ServerError('El channel_id es requerido', 400)
    }

    const channel_found = await channel_repository.getById(channel_id)

    if(!channel_found){
        throw new ServerError('Canal no encontrado', 404)
    }

    const canal_pertenece_al_workspace = 
        channel_found.fk_id_espacio_trabajo.toString() === workspace_id.toString()

    if(!canal_pertenece_al_workspace){
        throw new ServerError('Canal no encontrado', 404)
    }

    return channel_found
}
