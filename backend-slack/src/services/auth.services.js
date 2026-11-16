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
import user_repository from "../repositories/user.repository.js"
import { compareHash, generateHash } from "../utils/bcrypt.util.js"
import ServerError from "../utils/error.util.js"
import { verification_email_template } from "../utils/templates/verificationEmail.template.js"
import { reset_password_email_template } from "../utils/templates/resetPasswordEmail.template.js"
import jwt from 'jsonwebtoken'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/*
Encriptamos la password para que en DB se guarde un dato irreversible
Viendo el dato irreversible es IMPROBABLE que se sepa el dato original
*/

/*
Registro de un nuevo usuario:
    - valida los datos recibidos
    - valida que el email no este registrado
    - hashea la password y crea el usuario en la DB
    - genera el token de verificacion y envia el mail
*/
export async function registerUser({ username, email, password }){

    if (!username || !email || !password) {
        throw new ServerError(
            "Email, password and username is required",
            400
        )
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new ServerError(
            "Email is incorrect",
            400
        )
    }

    //Validar si el mail ya esta registrado
    const user_already_exist = await user_repository.getByEmail(email)
    if (user_already_exist) {
        throw new ServerError(
            'Email is already used',
            400
        )
    }

    const password_hash = await generateHash(password)

    await user_repository.create(username, email, password_hash)

    await send_verification_email(email)
}

/*
Inicio de sesion:
    - valida los datos recibidos
    - busca el usuario y compara la password contra el hash guardado en DB
    - valida que el email este verificado
    - crea y devuelve el token de acceso (credencial firmada de sesion)

Cuando un usuario inicia sesion debemos darle una credencial firmada que
nos permita indicar quien es ese usuario para que mas adelante el usuario
nos devuelva dicha credencial y poder confiar en ella. Para poder crear
esta credencial firmada usamos JWT (JsonWebTokens): objetos de JS (JSON)
pasados a string (HS256) con una firma.
*/
export async function loginUser({ email, password }){

    if (
        !email || !password || typeof email !== "string" || typeof password !== "string"
    ) {
        throw new ServerError(
            "Email and password are required",
            400
        );
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new ServerError(
            "Email is incorrect",
            400
        );
    }

    const user = await user_repository.getByEmail(email)

    if (!user) {
        throw new ServerError(
            "Invalid email or password",
            401
        );
    }

    //Compara el hash guardado en DB contra la contraseña que nos envió por body el cliente.
    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) {
        throw new ServerError(
            "Invalid email or password",
            401
        );
    }

    if(!user.email_verificado){
        throw new ServerError(
            'Email no verificado',
            403
        )
    }

    /* Crear un token firmado de sesion */
    const auth_token = jwt.sign(
        {
            //Aca va a info que queres guardar en la credencial
            id: user._id,
            name: user.nombre,
            email: user.email
        },
        ENVIRONMENT.JWT_SECRET //Firmamos con esto
    )

    return auth_token
}

/*
Verificacion de email:
    - valida que el token venga y sea valido (firma + expiracion)
    - busca el usuario, valida que este activo y que no este ya verificado
    - marca el email como verificado en la DB
*/
export async function verifyUserEmail({ verification_token }){

    if(!verification_token){
        throw new ServerError('El token de verificacion es requerido', 400)
    }

    //Verificar el token (si es invalido o expiro, jwt.verify lanza un error)
    let email
    try{
        const payload = jwt.verify(
            verification_token,
            ENVIRONMENT.JWT_SECRET
        )
        email = payload.email
    }
    catch{
        throw new ServerError('El token de verificacion es invalido o expiro', 400)
    }

    const user_found = await user_repository.getByEmail(email)

    //Si no existe el usuario error
    if(!user_found){
        throw new ServerError('Usuario no encontrado', 404)
    }

    if(!user_found.activo){
        throw new ServerError('Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error', 403)
    }

    //Si ya estas verificado deja de intentar verificarte
    if(user_found.email_verificado){
        throw new ServerError('Ya estas verificado', 400)
    }

    //Actualizamos al usuario para verificarlo
    await user_repository.updateById(
        user_found._id,
        {
            email_verificado: true
        }
    )
}

/*
Reenvio del mail de verificacion:
    - valida que el email venga con formato valido
    - si el usuario existe, esta activo y falta verificar, genera un token
      NUEVO (reemplaza al anterior) y envia el mail
    - por seguridad NO revela si el email existe o si ya esta verificado
      (evitamos "email enumeration"): la respuesta es siempre la misma
*/
export async function resendUserVerificationEmail({ email }){

    if(!email){
        throw new ServerError('El email es requerido', 400)
    }

    if(!EMAIL_REGEX.test(email)){
        throw new ServerError('Email is incorrect', 400)
    }

    const user_found = await user_repository.getByEmail(email)

    if(user_found && user_found.activo && !user_found.email_verificado){
        await send_verification_email(email)
    }

    //Respuesta ambigua para todos los casos
    return 'Se enviara un mail con los pasos para verificar en caso de que esta cuenta sea real'
}

/*
Genera un token de verificacion (JWT de 7 dias) y envia el mail con la
plantilla de verificacion. Usada por el registro y por el reenvio.
*/
async function send_verification_email(email){
    const verify_email_token = jwt.sign(
        {
            email: email
        },
        ENVIRONMENT.JWT_SECRET,
        {
            expiresIn: '7d' // -> expira en 7 dias
        }
    )

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Verifica tu cuenta",
            html: verification_email_template(verify_email_token)
        }
    )
}

/*
Solicitud de restablecimiento de contraseña (forgot password):
    - valida que el email venga con formato valido
    - si el usuario existe y esta activo, genera un token de restablecimiento
      (JWT de corta duracion) y le envia un mail con un link al frontend:
      /reset-password?reset_token=xxxx
    - por seguridad NO revela si el email existe (evitamos email enumeration):
      la respuesta es siempre la misma
*/
export async function sendUserPasswordResetEmail({ email }){
    if(!email){
        throw new ServerError('El email es requerido', 400)
    }

    if(!EMAIL_REGEX.test(email)){
        throw new ServerError('Email is incorrect', 400)
    }

    const user_found = await user_repository.getByEmail(email)

    if(user_found && user_found.activo){
        await send_password_reset_email(email)
    }

    //Respuesta ambigua para todos los casos
    return 'Se enviara un mail con los pasos para restablecer la contraseña en caso de que esta cuenta sea real'
}

/*
Genera un token de restablecimiento (JWT de 15 minutos) y envia el mail
con la plantilla de restablecimiento.
*/
async function send_password_reset_email(email){
    const reset_password_token = jwt.sign(
        {
            email: email
        },
        ENVIRONMENT.JWT_SECRET,
        {
            expiresIn: '15m' // -> expira en 15 minutos
        }
    )

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Restablece tu contraseña",
            html: reset_password_email_template(reset_password_token)
        }
    )
}

/*
Restablecimiento de contraseña:
    - valida que el token, el email y la nueva password vengan
    - verifica que el token sea valido (firma + expiracion)
    - valida que el email recibido coincida con el email firmado en el token
    - busca el usuario, valida que exista y este activo
    - hashea la nueva password y la guarda en la DB
*/
export async function resetUserPassword({ reset_token, email, nueva_password }){
    if(!reset_token){
        throw new ServerError('El token de restablecimiento es requerido', 400)
    }

    if(!email){
        throw new ServerError('El email es requerido', 400)
    }

    if(!EMAIL_REGEX.test(email)){
        throw new ServerError('Email is incorrect', 400)
    }

    if(!nueva_password || typeof nueva_password !== 'string'){
        throw new ServerError('La nueva contraseña es requerida', 400)
    }

    //Verificar el token (si es invalido o expiro, jwt.verify lanza un error)
    let token_email
    try{
        const payload = jwt.verify(
            reset_token,
            ENVIRONMENT.JWT_SECRET
        )
        token_email = payload.email
    }
    catch{
        throw new ServerError('El token de restablecimiento es invalido o expiro', 400)
    }

    //El email que envia el cliente debe coincidir con el firmado en el token
    if(token_email !== email){
        throw new ServerError('El email no corresponde al token de restablecimiento', 400)
    }

    const user_found = await user_repository.getByEmail(email)

    if(!user_found){
        throw new ServerError('Usuario no encontrado', 404)
    }

    if(!user_found.activo){
        throw new ServerError('Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error', 403)
    }

    const password_hash = await generateHash(nueva_password)

    await user_repository.updateById(
        user_found._id,
        {
            password: password_hash
        }
    )
}
