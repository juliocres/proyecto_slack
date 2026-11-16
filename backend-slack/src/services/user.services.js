/*
SERVICES: capa de logica de negocio.

Los services NO conocen HTTP (no reciben request/response): reciben datos
planos, aplican las reglas de negocio (validaciones, verificaciones) y se
comunican con los repositories para acceder a la DB.

Los controllers quedan como una capa delgada: extraen los datos del
request, llaman al service correspondiente y arman la response HTTP.
*/

import user_repository from "../repositories/user.repository.js"
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
