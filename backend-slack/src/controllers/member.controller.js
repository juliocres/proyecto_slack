import { deleteMemberById as deleteMemberService, inviteMember as inviteMemberService, acceptInvitation as acceptInvitationService } from '../services/member.services.js'

/*
Los controllers son una capa delgada: solo manejan HTTP.
Extraen los datos del request, delegan la logica de negocio al service
correspondiente y arman la response con el status code apropiado.
*/

/*
(Owner, admin) POST /api/workspaces/:workspace_id/members/invite
body: { email, rol } (el rol con el que se crea la membresia: 'admin' o 'user')
Crea la membresia sin aceptar y envia un mail con un link para aceptar la invitacion.
*/
export async function inviteMember(request, response) {

    console.log("[INVITE MEMBER]", request.body)
    const { workspace_id } = request.params
    const { email, rol } = request.body

    await inviteMemberService({ workspace_id, email, rol })

    return response.status(201).send({
        ok: true,
        status: 201,
        message: "Se envio la invitacion al mail del usuario"
    })
}

/*
(Sin autenticacion) GET /api/workspaces/:workspace_id/members/accept-invite/:invitation_token
El token del link es la credencial: verifica que sea valido y marca la
membresia como aceptada.
*/
export async function acceptInvitation(request, response) {

    const { workspace_id, invitation_token } = request.params

    await acceptInvitationService({ workspace_id, invitation_token })

    return response.status(200).send({
        ok: true,
        status: 200,
        message: 'Invitacion aceptada exitosamente'
    })
}

/*
(Owner, admin) DELETE /api/workspaces/:workspace_id/members/:member_id
Elimina la membresia (saca al miembro del espacio de trabajo).
*/
export async function deleteMember(request, response) {

    const { workspace_id, member_id } = request.params

    await deleteMemberService({ workspace_id, member_id })

    return response.status(200).send({
        ok: true,
        message: "Miembro eliminado correctamente",
        status: 200,
        data: {
            member_id: member_id
        }
    })
}
