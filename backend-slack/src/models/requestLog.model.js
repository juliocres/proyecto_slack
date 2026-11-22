import mongoose from "mongoose"

/*
Registro de cada consulta que recibe el servidor.

El body de las requests con metodo POST, PUT y DELETE se guarda CIFRADO en
`body_cifrado` (AES-256-GCM con una clave derivada de LOGGER_PRIVATE_KEY).
Los endpoints de login, registro y reseteo de contraseña NO guardan body.
*/
const requestLogSchema = new mongoose.Schema(
    {
        ip: {
            type: String,
            required: true
        },
        /*
        User-Agent del cliente (navegador, Postman, curl, etc.).
        Es null si la request no lo envio. Se guarda recortado a 512 caracteres.
        */
        user_agent: {
            type: String,
            maxlength: 512,
            default: null
        },
        url: {
            type: String,
            required: true
        },
        endpoint: {
            type: String,
            required: true
        },
        metodo: {
            type: String,
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            default: null
        },
        fecha_consulta: {
            type: Date,
            default: Date.now
        },
        status_code: {
            type: Number,
            required: true
        },
        duracion_ms: {
            type: Number,
            required: true
        },
        /*
        Body de la request (POST, PUT, DELETE) cifrado con AES-256-GCM a partir
        de LOGGER_PRIVATE_KEY. Es null para GET/HEAD, para requests sin body y
        para los endpoints excluidos por seguridad (login, registro, reseteo).
        */
        body_cifrado: {
            type: String,
            default: null
        }
    }
)

export const REQUEST_LOG_COLLECTION_NAME = 'RegistroConsulta'
const RequestLog = mongoose.model(REQUEST_LOG_COLLECTION_NAME, requestLogSchema)

export default RequestLog
