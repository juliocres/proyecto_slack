import crypto from 'crypto'
import ENVIRONMENT from '../config/environment.config.js'

/*
Cifrado del body de las requests para el logger.

El body se guarda cifrado con AES-256-GCM usando una clave derivada de
LOGGER_PRIVATE_KEY (SHA-256), asi el contenido no queda en texto plano en la
base de datos.

Formato del valor guardado:
    v1:<iv en base64>:<tag de autenticacion en base64>:<datos en base64>
*/

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

function getKey() {
    if (!ENVIRONMENT.LOGGER_PRIVATE_KEY) {
        throw new Error('LOGGER_PRIVATE_KEY no esta configurada en las variables de entorno')
    }

    //Derivamos una clave de 32 bytes (requerida por AES-256) a partir de la clave del .env
    return crypto.createHash('sha256').update(ENVIRONMENT.LOGGER_PRIVATE_KEY).digest()
}

export function encryptLogBody(body) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)

    const plain_text = JSON.stringify(body)
    const encrypted = Buffer.concat([cipher.update(plain_text, 'utf8'), cipher.final()])
    const auth_tag = cipher.getAuthTag()

    return `v1:${iv.toString('base64')}:${auth_tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptLogBody(encrypted_body) {
    const [version, iv_base64, tag_base64, data_base64] = String(encrypted_body).split(':')

    if (version !== 'v1' || !iv_base64 || !tag_base64 || !data_base64) {
        throw new Error('Formato de body cifrado no soportado')
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        getKey(),
        Buffer.from(iv_base64, 'base64')
    )

    decipher.setAuthTag(Buffer.from(tag_base64, 'base64'))

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(data_base64, 'base64')),
        decipher.final()
    ])

    return JSON.parse(decrypted.toString('utf8'))
}
