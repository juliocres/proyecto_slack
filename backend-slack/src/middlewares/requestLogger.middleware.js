import mongoose from 'mongoose'
import connectMongoDB from '../config/mongo.config.js'
import request_log_repository from '../repositories/requestLog.repository.js'
import { encryptLogBody } from '../utils/crypto.util.js'

/*
Metodos cuyos body se registran (cifrados) en el log.
*/
const METHODS_WITH_BODY = ['POST', 'PUT', 'DELETE']

/*
Endpoints que NO registran body por seguridad (credenciales o tokens):
    - login / registro: email + password
    - reset-password / forgot-password: tokens y contraseñas
Se comparan en minusculas porque las rutas son case-insensitive.
*/
const ENDPOINTS_WITHOUT_BODY = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password',
    '/api/auth/forgot-password'
]

/*
Parametros del query string que pueden contener credenciales o tokens.
Sus valores se reemplazan antes de guardar la URL para no persistir secretos.
*/
const SENSITIVE_QUERY_PARAMS = [
    'token',
    'verification_token',
    'reset_token',
    'access_token',
    'password'
]

/*
Obtiene la IP real del cliente.
Detras de un proxy (Vercel, Nginx, etc.) la IP llega en x-forwarded-for.
Ademas normaliza las IPv4 mapeadas a IPv6 (::ffff:127.0.0.1 -> 127.0.0.1).
*/
function getClientIp(request) {
    const forwarded_header = request.headers['x-forwarded-for']

    let ip = request.ip

    if (typeof forwarded_header === 'string' && forwarded_header.length > 0) {
        ip = forwarded_header.split(',')[0].trim()
    }

    if (!ip) {
        ip = request.socket?.remoteAddress
    }

    if (!ip) {
        return 'desconocida'
    }

    return ip.startsWith('::ffff:') ? ip.slice(7) : ip
}

/*
Maximo de caracteres que se guardan del User-Agent (evita strings enormes).
*/
const MAX_USER_AGENT_LENGTH = 512

/*
Obtiene el User-Agent del cliente (navegador, Postman, curl, etc.).
Devuelve null si la request no lo envio.
*/
function getUserAgent(request) {
    const user_agent = request.headers['user-agent']

    if (!user_agent || typeof user_agent !== 'string') {
        return null
    }

    return user_agent.slice(0, MAX_USER_AGENT_LENGTH)
}

/*
Redacta los valores sensibles del query string sin modificar el resto de la URL.
*/
function redactSensitiveParams(url) {
    const query_index = url.indexOf('?')

    if (query_index === -1) {
        return url
    }

    const path = url.slice(0, query_index)
    const params = new URLSearchParams(url.slice(query_index + 1))

    for (const param of SENSITIVE_QUERY_PARAMS) {
        if (params.has(param)) {
            params.set(param, 'REDACTED')
        }
    }

    return `${path}?${params.toString()}`
}

/*
Guarda el user_id solo si la request fue autenticada y el id es un ObjectId
valido (asi una request publica queda con user_id: null).
*/
function getUserId(request) {
    const user_id = request.user?.id

    if (!user_id || !mongoose.isValidObjectId(user_id)) {
        return null
    }

    return user_id
}

/*
Normaliza el path de la request para compararlo con ENDPOINTS_WITHOUT_BODY:
    - quita el query string
    - pasa a minusculas
    - quita la barra final (excepto en la raiz)
*/
function normalizeEndpoint(url) {
    const path_only = url.split('?')[0].toLowerCase()

    if (path_only.length > 1 && path_only.endsWith('/')) {
        return path_only.slice(0, -1)
    }

    return path_only
}

/*
Decide si el body de esta request debe registrarse:
    - solo POST, PUT y DELETE (GET/HEAD no tienen body)
    - nunca en login, registro ni restablecimiento de contraseña
*/
function shouldLogBody(request) {
    if (!METHODS_WITH_BODY.includes(request.method)) {
        return false
    }

    const endpoint = normalizeEndpoint(request.originalUrl)

    return !ENDPOINTS_WITHOUT_BODY.includes(endpoint)
}

/*
Devuelve el body cifrado listo para persistir, o null si no corresponde
registrarlo (metodo sin body, endpoint excluido, body vacio) o si el cifrado
falla (por ejemplo, si falta LOGGER_PRIVATE_KEY).

El body se cifra con AES-256-GCM usando una clave derivada de
LOGGER_PRIVATE_KEY (ver src/utils/crypto.util.js), por lo que nunca se guarda
en texto plano en la base de datos.
*/
function getEncryptedBody(request) {
    if (!shouldLogBody(request)) {
        return null
    }

    const body = request.body

    if (!body) {
        return null
    }

    //Un objeto vacio (body {}) no aporta informacion: no lo registramos
    if (
        typeof body === 'object' &&
        !Array.isArray(body) &&
        Object.keys(body).length === 0
    ) {
        return null
    }

    try {
        return encryptLogBody(body)
    }
    catch (error) {
        console.error(
            '[RequestLogger] No se pudo cifrar el body de la consulta:',
            error.message
        )

        return null
    }
}

function requestLoggerMiddleware(request, response, next) {
    const inicio = Date.now()

    /*
    Se registra al finalizar la respuesta para que los middlewares de
    autenticacion ya hayan ejecutado y request.user este disponible.
    */
    response.on('finish', () => {
        const log_data = {
            ip: getClientIp(request),
            user_agent: getUserAgent(request),
            url: redactSensitiveParams(request.originalUrl),
            endpoint: request.originalUrl.split('?')[0],
            metodo: request.method,
            user_id: getUserId(request),
            fecha_consulta: new Date(),
            status_code: response.statusCode,
            duracion_ms: Date.now() - inicio,
            body_cifrado: getEncryptedBody(request)
        }

        console.log(
            `[REQUEST] ${log_data.metodo} ${log_data.url} ${log_data.status_code} ${log_data.duracion_ms}ms ip=${log_data.ip} user=${log_data.user_id ?? 'anonimo'} ua=${log_data.user_agent ? log_data.user_agent.slice(0, 40) : '-'} body=${log_data.body_cifrado ? 'cifrado' : '-'}`
        )

        /*
        El guardado es "fire and forget": si falla la base de datos o el
        registro, la respuesta al cliente no se ve afectada.
        */
        ;(async () => {
            try {
                await connectMongoDB()
                await request_log_repository.create(log_data)
            }
            catch (error) {
                console.error(
                    '[RequestLogger] No se pudo guardar el registro de la consulta:',
                    error.message
                )
            }
        })()
    })

    next()
}

export default requestLoggerMiddleware
