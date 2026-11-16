import { getChannelsByWorkspace as getChannelsByWorkspaceService, getChannelById as getChannelByIdService } from '../services/channel.services.js'

/*
Los controllers son una capa delgada: solo manejan HTTP.
Extraen los datos del request, delegan la logica de negocio al service
correspondiente y arman la response con el status code apropiado.
*/

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels
Trae la lista de canales que pertenecen al espacio de trabajo.
*/
export async function getChannelsByWorkspace(request, response) {

    const { workspace_id } = request.params

    const channels = await getChannelsByWorkspaceService(workspace_id)

    return response.status(200).send({
        ok: true,
        message: "Canales obtenidos correctamente",
        status: 200,
        data: {
            channels: channels
        }
    })
}

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels/:channel_id
Trae la informacion detallada de un canal en particular (nombre, descripcion, etc).
*/
export async function getChannelById(request, response) {

    const { workspace_id, channel_id } = request.params

    const channel_found = await getChannelByIdService(workspace_id, channel_id)

    return response.status(200).send({
        ok: true,
        message: "Canal obtenido correctamente",
        status: 200,
        data: {
            channel_selected: channel_found
        }
    })
}
