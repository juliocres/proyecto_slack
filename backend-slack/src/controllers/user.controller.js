import { getUsers as getUsersService, getUserById as getUserByIdService, deleteUserById as deleteUserByIdService } from '../services/user.services.js'

/*
Los controllers son una capa delgada: solo manejan HTTP.
Extraen los datos del request, delegan la logica de negocio al service
correspondiente y arman la response con el status code apropiado.
*/

export async function getUsers(request, response) {
    const user_list = await getUsersService()
    return response.status(200).send({
        ok: true,
        message: "Get users list",
        status: 200,
        data: {
            users: user_list
        }
    })
}

export async function getUserById(request, response) {
    const user_id = request.params.user_id

    const user_found = await getUserByIdService(user_id)

    return response.status(200).send(
        {
            ok: true,
            message: "Get user details successfully",
            status: 200,
            data: {
                user: user_found
            }
        }
    )
}

/*
(Authentified) DELETE /api/users/:user_id
Solo permite eliminar la propia cuenta. El borrado es ordenado:
membresias -> workspaces donde es owner -> usuario.
*/
export async function deleteUser(request, response) {

    const { user_id } = request.params

    const delete_summary = await deleteUserByIdService({
        user_id,
        requester_id: request.user.id
    })

    return response.status(200).send(
        {
            ok: true,
            message: "Usuario eliminado correctamente",
            status: 200,
            data: delete_summary
        }
    )
}
