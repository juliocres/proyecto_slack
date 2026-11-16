/*
SERVICES: capa de logica de negocio.

Los services NO conocen HTTP (no reciben request/response): reciben datos
planos, aplican las reglas de negocio (validaciones, verificaciones, creacion
de tokens, envio de mails) y se comunican con los repositories para acceder
a la DB.

Los controllers quedan como una capa delgada: extraen los datos del
request, llaman al service correspondiente y arman la response HTTP.
*/

import ENVIRONMENT from "../config/environment.config.js"
import mailer_transporter from "../config/mailer.config.js"
import member_repository from "../repositories/member.repository.js"
import user_repository from "../repositories/user.repository.js"
import workspace_repository from "../repositories/workspace.repository.js"
import ServerError from "../utils/error.util.js"
import { invitation_email_template } from "../utils/templates/invitationEmail.template.js"
import jwt from 'jsonwebtoken'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLES_VALIDOS_PARA_INVITAR = ['admin', 'user']

/*
Eliminar un miembro de un espacio de trabajo:
    - valida que la membresia exista
    - valida que la membresia pertenezca al workspace de la URL
      (si no pertenece, responde 404 para no revelar la existencia de la membresia)
    - valida que no se intente eliminar al owner del workspace
    - elimina la membresia de la DB
*/
export async function deleteMemberById({ workspace_id, member_id }){

    if(!member_id){
        throw new ServerError('El member_id es requerido', 400)
    }

    const membership_found = await member_repository.getById(member_id)

    if(!membership_found){
        throw new ServerError('Miembro no encontrado', 404)
    }

    const membership_pertenece_al_workspace = 
        membership_found.fk_id_espacio_trabajo.toString() === workspace_id.toString()

    if(!membership_pertenece_al_workspace){
        throw new ServerError('Miembro no encontrado', 404)
    }

    if(membership_found.rol === 'owner'){
        throw new ServerError('No se puede eliminar al owner del espacio de trabajo', 400)
    }

    await member_repository.deleteById(member_id)
}

/*
Invitar a un usuario a un espacio de trabajo:
    - valida que el email y el rol vengan, y que el rol sea 'admin' o 'user'
      (no se puede invitar directamente como 'owner')
    - valida que el workspace exista
    - valida que el usuario a invitar exista y este activo
    - valida que el usuario no tenga ya una membresia en ese workspace
    - crea la membresia con 'invitacion_aceptada': false
    - genera un token de invitacion (JWT de 7 dias) y envia el mail con un
      link para aceptar la invitacion
*/
export async function inviteMember({ workspace_id, email, rol }){

    if(!email){
        throw new ServerError('El email es requerido', 400)
    }

    if(!EMAIL_REGEX.test(email)){
        throw new ServerError('Email is incorrect', 400)
    }

    if(!rol){
        throw new ServerError('El rol es requerido', 400)
    }

    if(!ROLES_VALIDOS_PARA_INVITAR.includes(rol)){
        throw new ServerError('El rol debe ser admin o user', 400)
    }

    const workspace_found = await workspace_repository.getById(workspace_id)

    if(!workspace_found){
        throw new ServerError('Workspace no encontrado', 404)
    }

    const user_found = await user_repository.getByEmail(email)

    if(!user_found){
        throw new ServerError('Usuario no encontrado', 404)
    }

    if(!user_found.activo){
        throw new ServerError('Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error', 403)
    }

    const membership_already_exist = await member_repository.getMembershipByUserAndWorkspace(
        user_found._id, 
        workspace_found._id
    )

    if(membership_already_exist){
        throw new ServerError('El usuario ya es miembro de este espacio de trabajo', 400)
    }

    const membership_created = await member_repository.createInvitation(
        user_found._id, 
        workspace_found._id, 
        rol
    )

    await send_invitation_email({
        membership: membership_created,
        workspace: workspace_found,
        email: user_found.email
    })
}

/*
Genera un token de invitacion (JWT de 7 dias) firmado con el id de la
membresia y envia el mail con la plantilla de invitacion.
*/
async function send_invitation_email({ membership, workspace, email }){
    const invitation_token = jwt.sign(
        {
            //Aca va a info que queres guardar en la credencial
            membership_id: membership._id,
            workspace_id: workspace._id
        },
        ENVIRONMENT.JWT_SECRET, //Firmamos con esto
        {
            expiresIn: '7d' // -> expira en 7 dias
        }
    )

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Te invitaron a un espacio de trabajo",
            html: invitation_email_template(invitation_token, workspace)
        }
    )
}

/*
Aceptar una invitacion (endpoint SIN autenticacion, el token del link es la credencial):
    - valida que el token venga y sea valido (firma + expiracion)
    - valida que el workspace del token coincida con el de la URL
    - busca la membresia, valida que exista y pertenezca a ese workspace
    - valida que la invitacion no haya sido aceptada ya
    - marca la membresia como aceptada y activa
*/
export async function acceptInvitation({ workspace_id, invitation_token }){

    if(!invitation_token){
        throw new ServerError('El token de invitacion es requerido', 400)
    }

    //Verificar el token (si es invalido o expiro, jwt.verify lanza un error)
    let token_payload
    try{
        token_payload = jwt.verify(
            invitation_token,
            ENVIRONMENT.JWT_SECRET
        )
    }
    catch{
        throw new ServerError('El token de invitacion es invalido o expiro', 400)
    }

    //El workspace del token debe coincidir con el workspace de la URL
    if(token_payload.workspace_id.toString() !== workspace_id.toString()){
        throw new ServerError('El token de invitacion no corresponde a este espacio de trabajo', 400)
    }

    const membership_found = await member_repository.getById(token_payload.membership_id)

    if(!membership_found){
        throw new ServerError('Invitacion no encontrada', 404)
    }

    const membership_pertenece_al_workspace = 
        membership_found.fk_id_espacio_trabajo.toString() === workspace_id.toString()

    if(!membership_pertenece_al_workspace){
        throw new ServerError('Invitacion no encontrada', 404)
    }

    //Si ya aceptaste la invitacion deja de intentar aceptarla
    if(membership_found.invitacion_aceptada){
        throw new ServerError('La invitacion ya fue aceptada', 400)
    }

    //Aceptamos la invitacion: marcamos la membresia como aceptada y activa
    await member_repository.updateById(
        membership_found._id,
        {
            invitacion_aceptada: true,
            activo: true
        }
    )
}
