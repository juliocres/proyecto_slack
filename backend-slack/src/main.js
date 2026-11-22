import connectMongoDB from "./config/mongo.config.js";

//connectMongoDB()

import express from 'express'
import errorHandlerMiddleware from "./middlewares/error.middleware.js";
import auth_router from "./routes/auth.router.js";
import user_router from "./routes/user.router.js";
import workspace_router from "./routes/workspace.router.js";
import member_router from "./routes/member.router.js";
import channel_router from "./routes/channels.router.js";
import cors from 'cors'
import ENVIRONMENT from "./config/environment.config.js";
import swaggerUi from 'swagger-ui-express'
import swagger_document from './docs/swagger.js'
import requestLoggerMiddleware from './middlewares/requestLogger.middleware.js'


const PORT = ENVIRONMENT.PORT

const app = express()

/*
Confia en el proxy (Vercel, Nginx, etc.) para que request.ip devuelva la IP
real del cliente y no la del proxy.
*/
app.set('trust proxy', true)

app.use(cors())

/*
Logger de consultas: se monta antes de Swagger y de las rutas para registrar
todas las peticiones que recibe el servidor (incluidas 404 y /api/docs).
El body de POST, PUT y DELETE se guarda cifrado con LOGGER_PRIVATE_KEY, salvo
en login, registro y restablecimiento de contraseña (ver requestLogger.middleware.js).
*/
app.use(requestLoggerMiddleware)

app.use(express.json())

/*
Documentacion de la API (Swagger UI).

IMPORTANTE: se monta ANTES del middleware que conecta a MongoDB para que la
documentacion funcione aunque la base de datos este caida o lenta.
*/
app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(
        swagger_document,
        {
            customSiteTitle: 'Slack API - Documentacion',
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }
    )
)

//Especificacion OpenAPI cruda (util para Postman, Insomnia, Redoc, etc.)
app.get(
    '/api/docs.json',
    (request, response) => {
        return response.status(200).json(swagger_document)
    }
)

app.use(async (req, res, next) => {
    try {
        await connectMongoDB()
        next()
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);

        res.status(500).json({ message: "Error connecting to MongoDB" });
        next(error)
    }
})

app.use('/api/auth', auth_router)

app.use('/api/users', user_router)

app.use('/api/workspaces', workspace_router)

app.use('/api/workspaces/:workspace_id/members', member_router)

app.use('/api/workspaces/:workspace_id/channels', channel_router)

app.use(
    errorHandlerMiddleware
)

/*
En Vercel (serverless) NO se usa un servidor escuchando en un puerto: @vercel/node
toma el export por defecto de este archivo y lo usa como handler de la funcion.
Por eso solo hacemos app.listen() cuando NO estamos en Vercel (ej: en local).
*/
export default app

if (!process.env.VERCEL) {
    app.listen(
        PORT,
        () => {
            console.log(
                `El servidor se esta escuchando correctamente en http://localhost:${PORT}`
            )
        }
    )
}

