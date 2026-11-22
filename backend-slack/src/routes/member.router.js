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
/**
 * @openapi
 * /api/workspaces/{workspace_id}/members/invite:
 *   post:
 *     tags:
 *       - Members
 *     summary: Invitar a un usuario al workspace
 *     description: |
 *       Crea la membresia con `invitacion_aceptada: false` y `activo: false`,
 *       y envia un mail con un token de invitacion valido por 7 dias.
 *       Solo `owner` o `admin` pueden invitar. No se puede invitar como
 *       `owner`: los roles permitidos son `admin` y `user`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - rol
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de un usuario YA registrado en la plataforma.
 *                 example: pedro@mail.com
 *               rol:
 *                 type: string
 *                 enum:
 *                   - admin
 *                   - user
 *                 example: user
 *     responses:
 *       '201':
 *         description: Invitacion creada y mail enviado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *             example:
 *               ok: true
 *               status: 201
 *               message: Se envio la invitacion al mail del usuario
 *       '400':
 *         description: |
 *           Datos faltantes o invalidos, usuario ya miembro, header
 *           Authorization invalido o workspace_id con formato incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email_requerido:
 *                 summary: No se envio email
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El email es requerido
 *               email_invalido:
 *                 summary: Formato de email incorrecto
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email is incorrect
 *               rol_requerido:
 *                 summary: No se envio rol
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El rol es requerido
 *               rol_invalido:
 *                 summary: El rol no es admin ni user
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El rol debe ser admin o user
 *               ya_es_miembro:
 *                 summary: El usuario ya tiene membresia en el workspace
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El usuario ya es miembro de este espacio de trabajo
 *               header_ausente:
 *                 summary: No se envio el header Authorization
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Auth header is requered
 *               header_malformado:
 *                 summary: El header no tiene el formato "Bearer <token>"
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Auth header is malformed
 *               id_invalido:
 *                 summary: workspace_id no es un ObjectId valido
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El campo '_id' tiene un formato invalido (id incorrecto)
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         description: |
 *           El usuario no es miembro del workspace, no tiene rol owner/admin,
 *           o el usuario invitado esta desactivado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_es_miembro:
 *                 summary: El solicitante no tiene membresia en el workspace
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No eres miembro de este espacio de trabajo
 *               rol_insuficiente:
 *                 summary: El solicitante es user
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No tienes permisos suficientes para hacer esta operacion
 *               usuario_desactivado:
 *                 summary: El usuario invitado esta desactivado
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error
 *       '404':
 *         description: El workspace o el usuario invitado no existen.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               workspace_no_encontrado:
 *                 summary: El workspace no existe
 *                 value:
 *                   ok: false
 *                   status: 404
 *                   message: Workspace no encontrado
 *               usuario_no_encontrado:
 *                 summary: No hay usuario registrado con ese email
 *                 value:
 *                   ok: false
 *                   status: 404
 *                   message: Usuario no encontrado
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
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
/**
 * @openapi
 * /api/workspaces/{workspace_id}/members/accept-invite/{invitation_token}:
 *   get:
 *     tags:
 *       - Members
 *     summary: Aceptar una invitacion
 *     description: |
 *       NO requiere autenticacion: el token del link ES la credencial. Valida
 *       que el token sea valido (7 dias) y que corresponda al workspace de la
 *       URL, y marca la membresia como aceptada y activa.
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/InvitationToken'
 *     responses:
 *       '200':
 *         description: Invitacion aceptada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Invitacion aceptada exitosamente
 *       '400':
 *         description: Token invalido/expirado, de otro workspace o invitacion ya aceptada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               token_invalido:
 *                 summary: Token invalido o expirado
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de invitacion es invalido o expiro
 *               workspace_no_coincide:
 *                 summary: El token pertenece a otro workspace
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de invitacion no corresponde a este espacio de trabajo
 *               ya_aceptada:
 *                 summary: La invitacion ya habia sido aceptada
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: La invitacion ya fue aceptada
 *       '404':
 *         description: La membresia del token no existe o no pertenece al workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Invitacion no encontrada
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
member_router.get(
    '/accept-invite/:invitation_token',
    acceptInvitation
)

/*
(Owner, admin) DELETE /api/workspaces/:workspace_id/members/:member_id
Elimina la membresia (saca al miembro del espacio de trabajo).
*/
/**
 * @openapi
 * /api/workspaces/{workspace_id}/members/{member_id}:
 *   delete:
 *     tags:
 *       - Members
 *     summary: Eliminar un miembro del workspace
 *     description: |
 *       Elimina la membresia (no borra al usuario). Solo `owner` o `admin`.
 *       No se puede eliminar al `owner` del workspace.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/MemberId'
 *     responses:
 *       '200':
 *         description: Membresia eliminada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberDeletedResponse'
 *       '400':
 *         description: |
 *           Se intento eliminar al owner, header Authorization invalido o id
 *           con formato incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               owner_protegido:
 *                 summary: La membresia a eliminar es la del owner
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: No se puede eliminar al owner del espacio de trabajo
 *               header_ausente:
 *                 summary: No se envio el header Authorization
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Auth header is requered
 *               header_malformado:
 *                 summary: El header no tiene el formato "Bearer <token>"
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Auth header is malformed
 *               id_invalido:
 *                 summary: workspace_id o member_id no son ObjectId validos
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El campo '_id' tiene un formato invalido (id incorrecto)
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         description: El usuario no es miembro o no tiene rol owner/admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_es_miembro:
 *                 summary: No tiene membresia en el workspace
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No eres miembro de este espacio de trabajo
 *               rol_insuficiente:
 *                 summary: Es miembro pero su rol es user
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No tienes permisos suficientes para hacer esta operacion
 *       '404':
 *         description: El workspace no existe, o la membresia no existe o es de otro workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               workspace_no_encontrado:
 *                 summary: El workspace no existe
 *                 value:
 *                   ok: false
 *                   status: 404
 *                   message: Workspace no encontrado
 *               miembro_no_encontrado:
 *                 summary: La membresia no existe o no pertenece al workspace
 *                 value:
 *                   ok: false
 *                   status: 404
 *                   message: Miembro no encontrado
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
member_router.delete(
    '/:member_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    deleteMember
)

export default member_router
