import { registerUser, loginUser, verifyUserEmail, resendUserVerificationEmail, sendUserPasswordResetEmail, resetUserPassword } from '../services/auth.services.js'


/*
Para enviar en una request HTTP info a una API usamos el body

Las consultas (request) tipo GET NO TIENEN body
El body puede ser de distintos tipos de dato:
    Hoy vamos a usar JSON, para poder usar JSON nuestra API debe estar preparada para recibir ese tipo de informacion
*/

/*
Los controllers son una capa delgada: solo manejan HTTP.
Extraen los datos del request, delegan la logica de negocio al service
correspondiente y arman la response con el status code apropiado.
*/

export async function register(request, response) {

    const { username, email, password } = request.body

    await registerUser({ username, email, password })

    return response.status(201).send({
        ok: true,
        status: 201,
        message: "User registered successfully"
    })
}

/*
Cuando un usuario inicia sesion el service valida las credenciales,
verifica que el email este confirmado y crea el token de acceso
*/
export async function login(request, response) {
    const { email, password } = request.body;

    const auth_token = await loginUser({ email, password })

    return response.status(200).send({
        ok: true,
        message: "You have logged in successfully",
        status: 200,
        data: {
            auth_token
        }
    });
}


export async function verifyEmail (request, response){
    //El token viene por querystring: /verify-email?verification_token=xxxx
    const { verification_token } = request.query

    await verifyUserEmail({ verification_token })

    return response.status(200).send(
        {
            ok: true,
            status: 200,
            message: 'Usuario verificado exitosamente'
        }
    )
}

/*
Reenvio del mail de verificacion con un token nuevo.
El service devuelve un mensaje ambiguo a proposito (no revela si el
email existe o ya esta verificado, para evitar email enumeration)
*/
export async function resendVerificationEmail(request, response){
    const { email } = request.params

    const message = await resendUserVerificationEmail({ email })

    return response.status(200).send(
        {
            ok: true,
            status: 200,
            message
        }
    )
}

/*
Solicitud de restablecimiento de contraseña.
El service devuelve un mensaje ambiguo a proposito (no revela si el
email existe, para evitar email enumeration)
*/
export async function forgotPassword(request, response){
    const { email } = request.body

    const message = await sendUserPasswordResetEmail({ email })

    return response.status(200).send(
        {
            ok: true,
            status: 200,
            message
        }
    )
}

/*
Restablecimiento de contraseña.
El cliente envia el token (que recibio por mail), el email y la nueva password.
El service verifica que el token sea valido y que el email coincida con el
firmado en el token antes de actualizar la contraseña.
*/
export async function resetPassword(request, response){
    const { reset_token, email, nueva_password } = request.body

    await resetUserPassword({ reset_token, email, nueva_password })

    return response.status(200).send(
        {
            ok: true,
            status: 200,
            message: 'Contraseña restablecida exitosamente'
        }
    )
}
