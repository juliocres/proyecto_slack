import {
    getChannelsByWorkspace as getChannelsByWorkspaceService,
    getChannelById as getChannelByIdService,
    createChannel as createChannelService,
    updateChannel as updateChannelService,
    deleteChannel as deleteChannelService
} from '../services/channel.services.js'

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
(Todos los miembros) POST /api/workspaces/:workspace_id/channels
body: { name, description }
Crea un canal dentro del espacio de trabajo.
*/
export async function createChannel(request, response) {

    const { workspace_id } = request.params
    const { name, description } = request.body

    const channel_created = await createChannelService(workspace_id, name, description)

    return response.status(201).send({
        ok: true,
        message: "Canal creado correctamente",
        status: 201,
        data: {
            channel_created: channel_created
        }
    })
}

/*
(Owner, admin) PUT /api/workspaces/:workspace_id/channels/:channel_id
body: { name, description }
Edita el nombre y la descripcion de un canal.
*/
export async function updateChannel(request, response) {

    const { workspace_id, channel_id } = request.params
    const { name, description } = request.body

    const channel_updated = await updateChannelService(
        workspace_id,
        channel_id,
        name,
        description
    )

    return response.status(200).send({
        ok: true,
        message: "Canal actualizado correctamente",
        status: 200,
        data: {
            channel_updated: channel_updated
        }
    })
}

/*
(Owner, admin) DELETE /api/workspaces/:workspace_id/channels/:channel_id
Elimina el canal y sus mensajes.
*/
export async function deleteChannel(request, response) {

    const { workspace_id, channel_id } = request.params

    const channel_deleted = await deleteChannelService(workspace_id, channel_id)

    return response.status(200).send({
        ok: true,
        message: "Canal eliminado correctamente",
        status: 200,
        data: {
            channel_deleted: channel_deleted
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
