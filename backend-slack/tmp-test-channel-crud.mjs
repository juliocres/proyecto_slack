import jwt from 'jsonwebtoken'
import ENVIRONMENT from './src/config/environment.config.js'

const token = jwt.sign(
    {
        id: '6aff0fef812de57d742782ed',
        name: 'julio cesar',
        email: 'juliocresposotocesar@gmail.com'
    },
    ENVIRONMENT.JWT_SECRET
)

const base = 'http://127.0.0.1:8099/api/workspaces/6b02392084feca2a531555fc/channels'
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `bearer ${token}`
}

async function call(label, path, options = {}) {
    const response = await fetch(base + path, { headers, ...options })
    const json = await response.json()
    console.log(label, '->', response.status, JSON.stringify(json))
    return { status: response.status, json }
}

let ready = false
for (let i = 0; i < 20 && !ready; i++) {
    try {
        const r = await fetch('http://127.0.0.1:8099/api/docs.json')
        ready = r.ok
    }
    catch {
        await new Promise(resolve => setTimeout(resolve, 300))
    }
}
console.log('server ready:', ready)

const unique = `canal-qa-${Date.now()}`

const created = await call('crear', '', {
    method: 'POST',
    body: JSON.stringify({ name: unique, description: 'temporal' })
})

const channel_id = created.json?.data?.channel_created?._id

if (channel_id) {
    await call('editar', `/${channel_id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: `${unique}-editado`, description: 'descripcion editada' })
    })
    await call('editar duplicado', `/${channel_id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'test1', description: 'x' })
    })
    await call('editar nombre vacio', `/${channel_id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: '   ', description: 'x' })
    })
    await call('detalle', `/${channel_id}`, { method: 'GET' })
    await call('eliminar', `/${channel_id}`, { method: 'DELETE' })
    await call('detalle despues de eliminar', `/${channel_id}`, { method: 'GET' })
}
else {
    console.log('no se pudo crear el canal de prueba')
}

await call('eliminar inexistente', '/6b05960f3b21f680589e71ff', { method: 'DELETE' })
await call('listar final', '', { method: 'GET' })
