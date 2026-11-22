import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import { getChannelsByWorkspace, getChannelById } from '../controllers/channel.controller.js'
import { getChannelMessages } from '../controllers/message.controller.js'

//Este router se monta en workspace_router con:
//workspace_router.use('/:workspace_id/channels', channel_router)
//mergeParams hace que request.params incluya el :workspace_id del router padre
const channel_router = express.Router({mergeParams: true})

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels
Trae la lista de canales que pertenecen al espacio de trabajo.
*/
/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels:
 *   get:
 *     tags:
 *       - Channels
 *     summary: Listar los canales de un workspace
 *     description: |
 *       Devuelve todos los canales del workspace, sin paginacion. Requiere ser
 *       miembro (cualquier rol).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       '200':
 *         description: Lista de canales.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelsListResponse'
 *       '400':
 *         description: Header Authorization invalido o workspace_id con formato incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
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
 *         description: El usuario autenticado no es miembro del workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: No eres miembro de este espacio de trabajo
 *       '404':
 *         description: El workspace no existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Workspace no encontrado
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
channel_router.get(
    '/',
    authMiddleware,
    workspaceMiddleware([]),
    getChannelsByWorkspace
)

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels/:channel_id
Trae la informacion detallada de un canal en particular (nombre, descripcion, etc).
*/
/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}:
 *   get:
 *     tags:
 *       - Channels
 *     summary: Obtener un canal
 *     description: |
 *       Devuelve el canal. Si el canal no existe **o pertenece a otro
 *       workspace**, responde `404 Canal no encontrado` a proposito (no revela
 *       la existencia de canales de otros workspaces).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     responses:
 *       '200':
 *         description: Canal encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelDetailResponse'
 *       '400':
 *         description: Header Authorization invalido o algun id con formato incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
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
 *                 summary: workspace_id o channel_id no son ObjectId validos
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El campo '_id' tiene un formato invalido (id incorrecto)
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         description: El usuario autenticado no es miembro del workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: No eres miembro de este espacio de trabajo
 *       '404':
 *         description: El workspace no existe, o el canal no existe o es de otro workspace.
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
 *               canal_no_encontrado:
 *                 summary: El canal no existe o no pertenece al workspace
 *                 value:
 *                   ok: false
 *                   status: 404
 *                   message: Canal no encontrado
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
channel_router.get(
    '/:channel_id',
    authMiddleware,
    workspaceMiddleware([]),
    getChannelById
)

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels/:channel_id/messages
Trae el historial de mensajes de ese canal especifico.
*/
/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}/messages:
 *   get:
 *     tags:
 *       - Channels
 *     summary: Listar los mensajes de un canal
 *     description: |
 *       Devuelve el historial completo del canal (sin paginacion), ordenado del
 *       mas viejo al mas nuevo, con el autor populado (nombre y email).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     responses:
 *       '200':
 *         description: Historial de mensajes del canal.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagesListResponse'
 *       '400':
 *         description: Header Authorization invalido o algun id con formato incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
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
 *                 summary: workspace_id o channel_id no son ObjectId validos
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El campo '_id' tiene un formato invalido (id incorrecto)
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         description: El usuario autenticado no es miembro del workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: No eres miembro de este espacio de trabajo
 *       '404':
 *         description: El workspace no existe, o el canal no existe o es de otro workspace.
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
 *               canal_no_encontrado:
 *                 summary: El canal no existe o no pertenece al workspace
 *                 value:
 *                   ok: false
 *                   status: 404
 *                   message: Canal no encontrado
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
channel_router.get(
    '/:channel_id/messages',
    authMiddleware,
    workspaceMiddleware([]),
    getChannelMessages
)

export default channel_router
