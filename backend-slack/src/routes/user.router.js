import express from 'express'
import { getUserById, getUsers, deleteUser } from '../controllers/user.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const user_router = express.Router()

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Listar todos los usuarios
 *     description: |
 *       Devuelve todos los usuarios registrados, sin paginacion y sin
 *       autenticacion.
 *
 *       **Advertencia de seguridad:** cada usuario incluye el hash de su
 *       contraseña (`password`) y el estado de verificacion del email. Este es
 *       el comportamiento actual de la API.
 *     security: []
 *     responses:
 *       '200':
 *         description: Lista de usuarios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
user_router.get(
    '/',
    getUsers
)

/**
 * @openapi
 * /api/users/{user_id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtener un usuario por id
 *     description: |
 *       Busca un usuario por su ObjectId. Sin autenticacion.
 *
 *       **Advertencia de seguridad:** la respuesta incluye el hash de la
 *       contraseña (`password`). Este es el comportamiento actual de la API.
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       '200':
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetailResponse'
 *       '400':
 *         description: El user_id no tiene formato de ObjectId.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 400
 *               message: El campo '_id' tiene un formato invalido (id incorrecto)
 *       '404':
 *         description: No existe un usuario con ese id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: User not found
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
user_router.get(
    '/:user_id',
    getUserById
)

/**
 * @openapi
 * /api/users/{user_id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Eliminar la propia cuenta
 *     description: |
 *       Elimina la cuenta del usuario autenticado. Solo se puede eliminar la
 *       propia cuenta (el `user_id` debe coincidir con el usuario del token).
 *
 *       El borrado es ordenado para no dejar datos huerfanos:
 *       1. membresias de los workspaces donde el usuario es owner
 *       2. workspaces donde el usuario es owner (se eliminan para todos sus integrantes)
 *       3. membresias restantes del usuario
 *       4. el usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       '200':
 *         description: Usuario eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 status: { type: integer, example: 200 }
 *                 message: { type: string, example: Usuario eliminado correctamente }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_deleted: { type: string }
 *                     workspaces_deleted: { type: integer, example: 1 }
 *                     memberships_deleted: { type: integer, example: 1 }
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
user_router.delete(
    '/:user_id',
    authMiddleware,
    deleteUser
)

export default user_router
