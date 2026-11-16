import { 
    getAllWorkspacesByUserId as getAllWorkspacesByUserIdService, 
    createWorkspaceWithOwner as createWorkspaceService, 
    getMembersByWorkspaceId as getWorkspaceMembersService, 
    deleteWorkspaceWithMemberships as deleteWorkspaceByIdService, 
    updateWorkspace as updateWorkspaceByIdService 
} from '../services/workspace.services.js'

/*
Los controllers son una capa delgada: solo manejan HTTP.
Extraen los datos del request, delegan la logica de negocio al service
correspondiente y arman la response con el status code apropiado.
*/

/*
(Authentified) GET /api/workspaces
Trae la lista de espacios de trabajo asociados a ese usuario
(basicamente sus membresias), con el rol de membresia en cada espacio de trabajo.
*/
export async function getAllWorkspaces(request, response) {

    const workspaces_obtenidos = await getAllWorkspacesByUserIdService(request.user.id)

    return response.status(200).send({
        ok: true,
        message: "Obtenidos todos los datos",
        status: 200,
        data: {
            workspaces: workspaces_obtenidos
        }
    })
}

/*
(Authentified) POST /api/workspaces
body: { name, description }
Crea el espacio de trabajo y la membresia 'owner' para quien lo creo.
*/
export async function createWorkspace(request, response) {

    console.log("[CREATE WORKSPACE]", request.body)
    const { name, description } = request.body

    const { workspace_created, owner_membership } = await createWorkspaceService(
        name, 
        description, 
        request.user.id
    )

    return response.status(201).send({
        ok: true,
        status: 201,
        message: "Workspace creado correctamente",
        data: {
            workspace_created,
            owner_membership
        }
    })
}

/*
(Todos los miembros) GET /api/workspaces/:workspace_id
Trae el nombre y la informacion del espacio de trabajo.
La validacion de membresia la hace workspaceMiddleware.
*/
export async function getWorkspaceById(request, response) {

    return response.status(200).send({
        ok: true,
        message: "Workspace obtenido correctamente",
        status: 200,
        data: {
            workspace_selected: request.workspace
        }
    })
}

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/members
Trae la lista de miembros de ese espacio de trabajo.
*/
export async function getWorkspaceMembers(request, response) {

    const { workspace_id } = request.params

    const members = await getWorkspaceMembersService(workspace_id)

    return response.status(200).send({
        ok: true,
        message: "Miembros obtenidos correctamente",
        status: 200,
        data: {
            members: members
        }
    })
}

/*
(Owner) DELETE /api/workspaces/:workspace_id
Elimina el espacio de trabajo y todas sus membresias.
*/
export async function deleteWorkspaceById(request, response) {

    const { workspace_id } = request.params

    await deleteWorkspaceByIdService(workspace_id)

    return response.status(200).send({
        ok: true,
        message: "Workspace eliminado correctamente",
        status: 200,
        data: {
            workspace_deleted: request.workspace
        }
    })
}

/*
(Owner, admin) PUT /api/workspaces/:workspace_id
body: { name, description }
Actualiza el nombre y la descripcion del espacio de trabajo.
*/
export async function updateWorkspaceById(request, response) {

    const { workspace_id } = request.params
    const { name, description } = request.body

    const workspace_updated = await updateWorkspaceByIdService(workspace_id, name, description)

    return response.status(200).send({
        ok: true,
        message: "Workspace actualizado correctamente",
        status: 200,
        data: {
            workspace_updated: workspace_updated
        }
    })
}
