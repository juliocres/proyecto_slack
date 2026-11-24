import http from 'node:http'

const server = http.createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Headers', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

    if (request.method === 'OPTIONS') {
        response.writeHead(204)
        response.end()
        return
    }

    const auth = request.headers.authorization
    console.log('AUTH RECIBIDO:', JSON.stringify(auth), 'LEN:', auth?.length)

    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
        auth,
        length: auth?.length,
        raw_headers: request.rawHeaders
    }))
})

server.listen(8098, () => console.log('probe escuchando en 8098'))
