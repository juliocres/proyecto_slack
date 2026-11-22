import express from 'express'
import { login, register, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js'

const auth_router = express.Router()

/*
Validacion del email del usuario
*/
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrar un usuario
 *     description: |
 *       Crea el usuario con la contraseña hasheada (bcrypt) y envia un mail de
 *       verificacion con un token valido por 7 dias. El usuario no puede
 *       iniciar sesion hasta verificar su email.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: maria
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@mail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: pepe123
 *     responses:
 *       '201':
 *         description: Usuario registrado. Se envio el mail de verificacion.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       '400':
 *         description: Datos faltantes, email con formato invalido o email ya registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               campos_faltantes:
 *                 summary: Falta username, email o password
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email, password and username is required
 *               email_invalido:
 *                 summary: Formato de email incorrecto
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email is incorrect
 *               email_ya_registrado:
 *                 summary: El email ya pertenece a otro usuario
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email is already used
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
auth_router.post('/register', register)

/*
Cuando un usuario inicia sesion debemos crear de alguna forma la sesion
*/
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Iniciar sesion
 *     description: |
 *       Valida las credenciales y que el email este verificado. Devuelve un JWT
 *       de sesion que debe enviarse como `Authorization: Bearer <token>`.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@mail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: pepe123
 *     responses:
 *       '200':
 *         description: Login exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '400':
 *         description: Datos faltantes o email con formato invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               campos_faltantes:
 *                 summary: Falta email o password
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email and password are required
 *               email_invalido:
 *                 summary: Formato de email incorrecto
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email is incorrect
 *       '401':
 *         description: Credenciales invalidas (no se distingue si fallo el email o la password).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 401
 *               message: Invalid email or password
 *       '403':
 *         description: El email del usuario todavia no fue verificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: Email no verificado
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
auth_router.post('/login', login)

/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verificar el email
 *     description: |
 *       Recibe por query string el token enviado por mail y marca el email como
 *       verificado. El token es un JWT valido por 7 dias.
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/VerificationToken'
 *     responses:
 *       '200':
 *         description: Email verificado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Usuario verificado exitosamente
 *       '400':
 *         description: Token ausente, invalido, expirado o email ya verificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               token_requerido:
 *                 summary: No se envio verification_token
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de verificacion es requerido
 *               token_invalido:
 *                 summary: Token invalido o expirado
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de verificacion es invalido o expiro
 *               ya_verificado:
 *                 summary: El email ya estaba verificado
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Ya estas verificado
 *       '403':
 *         description: La cuenta del usuario esta desactivada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error
 *       '404':
 *         description: El email firmado en el token no corresponde a ningun usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Usuario no encontrado
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
auth_router.get('/verify-email',  verifyEmail)

/*
Reenvio del mail de verificacion con un token nuevo
Ej: GET /api/auth/verify-email/test@mail.com/resend
*/
/**
 * @openapi
 * /api/auth/verify-email/{email}/resend:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Reenviar el mail de verificacion
 *     description: |
 *       Genera un token nuevo (invalida el anterior) y reenvia el mail de
 *       verificacion. Por seguridad la respuesta es siempre la misma, exista o
 *       no el usuario y este verificado o no (evita email enumeration).
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmailPath'
 *     responses:
 *       '200':
 *         description: |
 *           Mensaje ambiguo intencional. El mail solo se envia si el usuario
 *           existe, esta activo y falta verificar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Se enviara un mail con los pasos para verificar en caso de que esta cuenta sea real
 *       '400':
 *         description: Email con formato invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 400
 *               message: Email is incorrect
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
auth_router.get('/verify-email/:email/resend', resendVerificationEmail)

/*
Solicitud de restablecimiento de contraseña:
Envia un mail con un token (si el usuario existe) para poder restablecerla
*/
/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Solicitar restablecimiento de contraseña
 *     description: |
 *       Si el usuario existe y esta activo, envia un mail con un token de
 *       restablecimiento valido por 15 minutos. Por seguridad la respuesta es
 *       siempre la misma (evita email enumeration).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@mail.com
 *     responses:
 *       '200':
 *         description: |
 *           Mensaje ambiguo intencional. El mail solo se envia si el usuario
 *           existe y esta activo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Se enviara un mail con los pasos para restablecer la contraseña en caso de que esta cuenta sea real
 *       '400':
 *         description: Email ausente o con formato invalido.
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
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
auth_router.post('/forgot-password', forgotPassword)

/*
Restablecimiento de contraseña:
Recibe el token (del mail), el email y la nueva password
*/
/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Restablecer la contraseña
 *     description: |
 *       Verifica el token recibido por mail, valida que el email coincida con el
 *       firmado en el token y actualiza la contraseña (hasheada con bcrypt).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reset_token
 *               - email
 *               - nueva_password
 *             properties:
 *               reset_token:
 *                 type: string
 *                 description: JWT de restablecimiento recibido por mail (valido 15 minutos).
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@mail.com
 *               nueva_password:
 *                 type: string
 *                 format: password
 *                 example: nuevaClave123
 *     responses:
 *       '200':
 *         description: Contraseña actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Contraseña restablecida exitosamente
 *       '400':
 *         description: |
 *           Datos faltantes, email invalido, token invalido/expirado o el email
 *           no coincide con el firmado en el token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               token_requerido:
 *                 summary: No se envio reset_token
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de restablecimiento es requerido
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
 *               password_requerida:
 *                 summary: No se envio nueva_password
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: La nueva contraseña es requerida
 *               token_invalido:
 *                 summary: Token invalido o expirado
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de restablecimiento es invalido o expiro
 *               email_no_coincide:
 *                 summary: El email no corresponde al token
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El email no corresponde al token de restablecimiento
 *       '403':
 *         description: La cuenta del usuario esta desactivada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error
 *       '404':
 *         description: El email del token no corresponde a ningun usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Usuario no encontrado
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
auth_router.post('/reset-password', resetPassword)

export default auth_router
