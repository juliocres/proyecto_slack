import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import { getChannelsByWorkspace, getChannelById, createChannel, updateChannel, deleteChannel } from '../controllers/channel.controller.js'
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
(Todos los miembros) POST /api/workspaces/:workspace_id/channels
body: { name, description }
Crea un canal dentro del espacio de trabajo.
*/
/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels:
 *   post:
 *     tags:
 *       - Channels
 *     summary: Crear un canal
 *     description: |
 *       Crea un canal en el workspace. Requiere ser miembro (cualquier rol).
 *       El nombre se normaliza al estilo Slack: se quita el `#` inicial, los
 *       espacios se reemplazan por `-` y se pasa a minusculas. No se permiten
 *       dos canales con el mismo nombre en el mismo workspace.
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 80
 *                 example: proyecto-final
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Coordinacion del proyecto final del curso.
 *     responses:
 *       '201':
 *         description: Canal creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelCreatedResponse'
 *       '400':
 *         description: Header Authorization invalido, id con formato incorrecto o body invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               nombre_requerido:
 *                 summary: No se envio el nombre del canal
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: name es un campo requerido
 *               nombre_largo:
 *                 summary: El nombre supera los 80 caracteres
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El nombre del canal no puede superar los 80 caracteres
 *               descripcion_larga:
 *                 summary: La descripcion supera los 1000 caracteres
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: La descripcion del canal no puede superar los 1000 caracteres
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
 *       '409':
 *         description: Ya existe un canal con ese nombre en el workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 409
 *               message: Ya existe un canal con ese nombre en este espacio de trabajo
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
channel_router.post(
    '/',
    authMiddleware,
    workspaceMiddleware([]),
    createChannel
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
(Owner, admin) PUT /api/workspaces/:workspace_id/channels/:channel_id
body: { name, description }
Edita el nombre y la descripcion de un canal.
*/
/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}:
 *   put:
 *     tags:
 *       - Channels
 *     summary: Editar un canal
 *     description: |
 *       Actualiza el nombre y la descripcion del canal. Requiere rol `owner`
 *       o `admin`. El nombre se normaliza igual que al crear (sin `#`, sin
 *       espacios, en minusculas) y no puede repetirse en el workspace.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 80
 *                 example: proyecto-final
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Coordinacion del proyecto final del curso.
 *     responses:
 *       '200':
 *         description: Canal actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelUpdatedResponse'
 *       '400':
 *         description: Datos invalidos, header Authorization invalido o id con formato incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               nombre_requerido:
 *                 summary: No se envio el nombre del canal
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: name es un campo requerido
 *               nombre_largo:
 *                 summary: El nombre supera los 80 caracteres
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El nombre del canal no puede superar los 80 caracteres
 *               descripcion_larga:
 *                 summary: La descripcion supera los 1000 caracteres
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: La descripcion del canal no puede superar los 1000 caracteres
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
 *       '409':
 *         description: Ya existe otro canal con ese nombre en el workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 409
 *               message: Ya existe un canal con ese nombre en este espacio de trabajo
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
channel_router.put(
    '/:channel_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    updateChannel
)

/*
(Owner, admin) DELETE /api/workspaces/:workspace_id/channels/:channel_id
Elimina el canal y sus mensajes.
*/
/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}:
 *   delete:
 *     tags:
 *       - Channels
 *     summary: Eliminar un canal
 *     description: |
 *       Elimina el canal y todos sus mensajes. Requiere rol `owner` o `admin`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     responses:
 *       '200':
 *         description: Canal eliminado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelDeletedResponse'
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
 *               id_invalido:
 *                 summary: workspace_id o channel_id no son ObjectId validos
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
channel_router.delete(
    '/:channel_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    deleteChannel
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
