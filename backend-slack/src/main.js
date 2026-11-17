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


const PORT = ENVIRONMENT.PORT

const app = express()


app.use(cors())

app.use(express.json())

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

