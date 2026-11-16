const API_URL = import.meta.env.VITE_APP_URL_BACKEND

export async function login (email, password){
    const response_http = await fetch(
        API_URL + '/api/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }

    return response_body
}

/* 
JSON.stringify sirve para transformar un Objeto de JS en un JSON
*/


export async function  register(username, email, password) {
    const response_http = await fetch(
        API_URL + '/api/auth/register',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        }
    )
    //Leemos el cuerpo de la respuesta como un JSON
    const response_body = await response_http.json()
    
    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

export async function verifyEmail(verification_token) {
    /* 
    Las consultas GET no tienen body, el token viaja por querystring
    */
    const response_http = await fetch(
        API_URL + '/api/auth/verify-email?verification_token=' + verification_token,
        {
            method: 'GET'
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/*
Pedimos un token nuevo: GET /api/auth/verify-email/:email/resend
El email viaja en la URL, lo codificamos con encodeURIComponent para que los
caracteres especiales (@, espacios) no rompan la request
*/
export async function resendVerificationEmail(email) {
    const response_http = await fetch(
        API_URL + '/api/auth/verify-email/' + encodeURIComponent(email) + '/resend',
        {
            method: 'GET'
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/*
Solicitud de restablecimiento de contraseña:
le pedimos al backend que envie un mail con el token para restablecerla
*/
export async function forgotPassword(email) {
    const response_http = await fetch(
        API_URL + '/api/auth/forgot-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/*
Restablecimiento de contraseña:
enviamos el token (que llegó por mail), el email y la nueva contraseña
*/
export async function resetPassword(reset_token, email, nueva_password) {
    const response_http = await fetch(
        API_URL + '/api/auth/reset-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                reset_token: reset_token,
                email: email,
                nueva_password: nueva_password
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}