import express from 'express'
import {
    getAllWorkspaces,
    createWorkspace,
    getWorkspaceById,
    getWorkspaceMembers,
    deleteWorkspaceById,
    updateWorkspaceById
} from '../controllers/workspace.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'

const workspace_router = express.Router()

/**
 * @openapi
 * /api/workspaces:
 *   get:
 *     tags:
 *       - Workspaces
 *     summary: Listar los workspaces del usuario autenticado
 *     description: |
 *       Devuelve los espacios de trabajo donde el usuario tiene una membresia.
 *       Cada item incluye el rol del usuario en ese workspace y la lista
 *       completa de miembros del workspace.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de workspaces con sus miembros.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceListResponse'
 *       '400':
 *         description: Header Authorization ausente o malformado.
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
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
workspace_router.get('/', authMiddleware, getAllWorkspaces)

/**
 * @openapi
 * /api/workspaces:
 *   post:
 *     tags:
 *       - Workspaces
 *     summary: Crear un workspace
 *     description: |
 *       Crea el espacio de trabajo y, automaticamente, la membresia con rol
 *       `owner` para el usuario autenticado (activa y con la invitacion
 *       aceptada).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 example: Equipo de desarrollo
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Espacio de trabajo para el proyecto final
 *     responses:
 *       '201':
 *         description: Workspace y membresia owner creados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceCreatedResponse'
 *       '400':
 *         description: Falta el nombre del workspace o el header Authorization es invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               name_requerido:
 *                 summary: No se envio name
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: name es un campo requerido
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
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
workspace_router.post('/', authMiddleware, createWorkspace)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   get:
 *     tags:
 *       - Workspaces
 *     summary: Obtener un workspace
 *     description: |
 *       Devuelve los datos del workspace. Requiere que el usuario autenticado
 *       sea miembro (cualquier rol) del workspace.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       '200':
 *         description: Workspace encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceDetailResponse'
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
workspace_router.get(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceById
)

/**
 * @openapi
 * /api/workspaces/{workspace_id}/members:
 *   get:
 *     tags:
 *       - Workspaces
 *     summary: Listar los miembros de un workspace
 *     description: |
 *       Devuelve las membresias del workspace con los datos del usuario
 *       (nombre y email). Requiere ser miembro (cualquier rol).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       '200':
 *         description: Lista de miembros.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembersListResponse'
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
workspace_router.get(
    '/:workspace_id/members',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceMembers
)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   delete:
 *     tags:
 *       - Workspaces
 *     summary: Eliminar un workspace
 *     description: |
 *       Elimina el workspace y todas sus membresias. Solo el `owner` puede
 *       hacerlo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       '200':
 *         description: Workspace eliminado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceDeletedResponse'
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
 *         description: El usuario no es miembro o no tiene rol owner.
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
 *                 summary: Es miembro pero no es owner
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No tienes permisos suficientes para hacer esta operacion
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
workspace_router.delete(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner']),
    deleteWorkspaceById
)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   put:
 *     tags:
 *       - Workspaces
 *     summary: Actualizar un workspace
 *     description: |
 *       Actualiza el nombre y la descripcion del workspace. Requiere rol
 *       `owner` o `admin`. Ambos campos son obligatorios (no hay actualizacion
 *       parcial).
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
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 example: Equipo de desarrollo
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Nueva descripcion del espacio de trabajo
 *     responses:
 *       '200':
 *         description: Workspace actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceUpdatedResponse'
 *       '400':
 *         description: Faltan name/description o el header/id es invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               campos_requeridos:
 *                 summary: Falta name o description
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: name y description son campos requeridos
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
workspace_router.put(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    updateWorkspaceById
)

export default workspace_router
