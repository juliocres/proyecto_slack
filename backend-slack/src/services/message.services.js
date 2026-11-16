/*
SERVICES: capa de logica de negocio.

Los services NO conocen HTTP (no reciben request/response): reciben datos
planos, aplican las reglas de negocio (validaciones, verificaciones) y se
comunican con los repositories para acceder a la DB.
*/

import channelMessage_repository from "../repositories/channelMessage.repository.js"
import { getChannelById } from "./channel.services.js"

/*
Obtener el historial de mensajes de un canal:
    - valida que el canal exista y pertenezca al workspace (reutiliza la
      logica del service de canales)
    - trae los mensajes del canal con los datos del autor
*/
export async function getChannelMessages(workspace_id, channel_id){

    await getChannelById(workspace_id, channel_id)

    const messages = await channelMessage_repository.getAllByChannelId(channel_id)

    return messages
}
