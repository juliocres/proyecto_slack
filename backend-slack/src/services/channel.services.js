/*
SERVICES: capa de logica de negocio.

Los services NO conocen HTTP (no reciben request/response): reciben datos
planos, aplican las reglas de negocio (validaciones, verificaciones) y se
comunican con los repositories para acceder a la DB.
*/

import channel_repository from "../repositories/channel.repository.js"
import channelMessage_repository from "../repositories/channelMessage.repository.js"
import ServerError from "../utils/error.util.js"

/*
Normaliza el nombre al estilo Slack:
    - quita el '#' inicial
    - reemplaza espacios por '-'
    - pasa a minusculas
Tambien valida que venga y que no supere los 80 caracteres.
*/
function normalizeChannelName(name){

    if(typeof name !== 'string' || !name.trim()){
        throw new ServerError('name es un campo requerido', 400)
    }

    const channel_name = name
        .trim()
        .replace(/^#+/, '')
        .replace(/\s+/g, '-')
        .toLowerCase()

    if(!channel_name){
        throw new ServerError('name es un campo requerido', 400)
    }

    if(channel_name.length > 80){
        throw new ServerError('El nombre del canal no puede superar los 80 caracteres', 400)
    }

    return channel_name
}

/*
La descripcion es opcional: si no viene se guarda vacia.
Maximo 1000 caracteres (igual que el modelo).
*/
function normalizeChannelDescription(description){

    const channel_description = typeof description === 'string'
        ? description.trim()
        : ''

    if(channel_description.length > 1000){
        throw new ServerError('La descripcion del canal no puede superar los 1000 caracteres', 400)
    }

    return channel_description
}

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
Crear un canal dentro de un espacio de trabajo:
    - valida que venga el workspace_id y el nombre
    - normaliza el nombre y la descripcion
    - evita nombres duplicados dentro del mismo workspace
*/
export async function createChannel(workspace_id, name, description){

    if(!workspace_id){
        throw new ServerError('El workspace_id es requerido', 400)
    }

    const channel_name = normalizeChannelName(name)
    const channel_description = normalizeChannelDescription(description)

    const channel_exists = await channel_repository.getByNameAndWorkspace(channel_name, workspace_id)

    if(channel_exists){
        throw new ServerError('Ya existe un canal con ese nombre en este espacio de trabajo', 409)
    }

    return await channel_repository.createChannel(
        channel_name,
        channel_description,
        workspace_id
    )
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

/*
Editar un canal (nombre y descripcion):
    - valida que el canal exista y sea del workspace
    - normaliza y valida los datos
    - evita que el nuevo nombre choque con otro canal del workspace
*/
export async function updateChannel(workspace_id, channel_id, name, description){

    if(!channel_id){
        throw new ServerError('El channel_id es requerido', 400)
    }

    const channel_name = normalizeChannelName(name)
    const channel_description = normalizeChannelDescription(description)

    const channel_found = await getChannelById(workspace_id, channel_id)

    const channel_exists = await channel_repository.getByNameAndWorkspace(
        channel_name,
        workspace_id,
        channel_found._id
    )

    if(channel_exists){
        throw new ServerError('Ya existe un canal con ese nombre en este espacio de trabajo', 409)
    }

    return await channel_repository.updateById(
        channel_found._id,
        channel_name,
        channel_description
    )
}

/*
Eliminar un canal:
    - valida que el canal exista y sea del workspace
    - borra primero sus mensajes para no dejar registros huerfanos
    - borra el canal
*/
export async function deleteChannel(workspace_id, channel_id){

    if(!channel_id){
        throw new ServerError('El channel_id es requerido', 400)
    }

    const channel_found = await getChannelById(workspace_id, channel_id)

    await channelMessage_repository.deleteAllByChannelId(channel_found._id)

    await channel_repository.deleteById(channel_found._id)

    return channel_found
}
