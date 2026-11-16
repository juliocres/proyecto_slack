import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import { getChannelsByWorkspace, getChannelById } from '../controllers/channel.controller.js'
import { getChannelMessages } from '../controllers/message.controller.js'

//Este router se monta en workspace_router con:
//workspace_router.use('/:workspace_id/channels', channel_router)
//mergeParams hace que request.params incluya el :workspace_id del router padre
const channel_router = express.Router({mergeParams: true})

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels
Trae la lista de canales que pertenecen al espacio de trabajo.
*/
channel_router.get(
    '/',
    authMiddleware,
    workspaceMiddleware([]),
    getChannelsByWorkspace
)

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels/:channel_id
Trae la informacion detallada de un canal en particular (nombre, descripcion, etc).
*/
channel_router.get(
    '/:channel_id',
    authMiddleware,
    workspaceMiddleware([]),
    getChannelById
)

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/channels/:channel_id/messages
Trae el historial de mensajes de ese canal especifico.
*/
channel_router.get(
    '/:channel_id/messages',
    authMiddleware,
    workspaceMiddleware([]),
    getChannelMessages
)

export default channel_router
