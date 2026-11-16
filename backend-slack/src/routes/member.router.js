import express from 'express'
import { inviteMember, acceptInvitation, deleteMember } from '../controllers/member.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'

//Este router se monta en main.js con:
//app.use('/api/workspaces/:workspace_id/members', member_router)
//mergeParams hace que request.params incluya el :workspace_id del path del padre
const member_router = express.Router({mergeParams: true})

/*
(Owner, admin) POST /api/workspaces/:workspace_id/members/invite
body: { email, rol }
Crea la membresia con 'invitacion_aceptada': false y envia un mail con un
link para aceptar la invitacion (el link tiene un token con expiracion).
*/
member_router.post(
    '/invite',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    inviteMember
)

/*
(Sin autenticacion) GET /api/workspaces/:workspace_id/members/accept-invite/:invitation_token
Verifica que el invitation_token sea valido y edita la membresia para
marcar que el usuario la acepto.
*/
member_router.get(
    '/accept-invite/:invitation_token',
    acceptInvitation
)

/*
(Owner, admin) DELETE /api/workspaces/:workspace_id/members/:member_id
Elimina la membresia (saca al miembro del espacio de trabajo).
*/
member_router.delete(
    '/:member_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    deleteMember
)

export default member_router
