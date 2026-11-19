/*
SERVICES: capa de logica de negocio.

Los services NO conocen HTTP (no reciben request/response): reciben datos
planos, aplican las reglas de negocio (validaciones, verificaciones) y se
comunican con los repositories para acceder a la DB.

Los controllers quedan como una capa delgada: extraen los datos del
request, llaman al service correspondiente y arman la response HTTP.
*/

import user_repository from "../repositories/user.repository.js"
import member_repository from "../repositories/member.repository.js"
import workspace_repository from "../repositories/workspace.repository.js"
import ServerError from "../utils/error.util.js"

/*
Obtener la lista de usuarios
*/
export async function getUsers(){

    const user_list = await user_repository.get()

    return user_list
}

/*
Obtener un usuario por id:
    - valida que el id venga
    - busca el usuario, valida que exista
*/
export async function getUserById(user_id){

    if(!user_id){
        throw new ServerError('El user_id es requerido', 400)
    }

    const user_found = await user_repository.getById(user_id)

    if(!user_found){
        throw new ServerError("User not found", 404)
    }

    return user_found
}

/*
Eliminar un usuario (borrado ordenado para no dejar datos huerfanos):
    1. valida que el user_id venga
    2. valida que quien hace la peticion sea el mismo usuario
       (no existe un rol global de admin en el modelo de usuarios)
    3. valida que el usuario exista
    4. borra las membresias de los workspaces donde el usuario es owner
       (esos workspaces se eliminan para todos sus integrantes)
    5. borra los workspaces donde el usuario es owner
    6. borra las membresias restantes del usuario (en workspaces de otros)
    7. borra el usuario
*/
export async function deleteUserById({ user_id, requester_id }){

    if(!user_id){
        throw new ServerError('El user_id es requerido', 400)
    }

    if(!requester_id || requester_id.toString() !== user_id.toString()){
        throw new ServerError('Solo podes eliminar tu propia cuenta', 403)
    }

    const user_found = await user_repository.getById(user_id)

    if(!user_found){
        throw new ServerError("User not found", 404)
    }

    //Todas las membresias del usuario (incluye las de workspaces donde es owner)
    const memberships = await member_repository.getMembershipsByUserId(user_id)

    //Workspaces donde el usuario es owner: se eliminan junto con TODAS sus membresias
    const owned_workspace_ids = memberships
        .filter(membership => membership.rol === 'owner')
        .map(membership => membership.fk_id_espacio_trabajo)

    for(const workspace_id of owned_workspace_ids){
        await member_repository.deleteAllMembershipsByWorkspaceId(workspace_id)
        await workspace_repository.deleteById(workspace_id)
    }

    //Membresias restantes: las que tiene en workspaces de otras personas
    const other_memberships = memberships.filter(
        membership => membership.rol !== 'owner'
    )

    for(const membership of other_memberships){
        await member_repository.deleteById(membership._id)
    }

    await user_repository.deleteById(user_id)

    return {
        user_deleted: user_id,
        workspaces_deleted: owned_workspace_ids.length,
        memberships_deleted: memberships.length
    }
}
