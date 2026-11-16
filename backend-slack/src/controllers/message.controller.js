import { getChannelMessages as getChannelMessagesService } from '../services/message.services.js'

/*
Los controllers son una capa delgada: solo manejan HTTP.
Extraen los datos del request, delegan la logica de negocio al service
correspondiente y arman la response con el status code apropiado.
*/

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels/:channel_id/messages
Trae el historial de mensajes de ese canal especifico.
*/
export async function getChannelMessages(request, response) {

    const { workspace_id, channel_id } = request.params

    const messages = await getChannelMessagesService(workspace_id, channel_id)

    return response.status(200).send({
        ok: true,
        message: "Mensajes obtenidos correctamente",
        status: 200,
        data: {
            messages: messages
        }
    })
}
