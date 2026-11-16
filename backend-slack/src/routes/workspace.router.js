import express from 'express'
import {
    getAllWorkspaces,
    createWorkspace,
    getWorkspaceById,
    getWorkspaceMembers,
    deleteWorkspaceById,
    updateWorkspaceById
} from '../controllers/workspace.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'

const workspace_router = express.Router()


workspace_router.get('/', authMiddleware, getAllWorkspaces)

workspace_router.post('/', authMiddleware, createWorkspace)

workspace_router.get(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceById
)

workspace_router.get(
    '/:workspace_id/members',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceMembers
)

workspace_router.delete(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner']),
    deleteWorkspaceById
)

workspace_router.put(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    updateWorkspaceById
)





export default workspace_router
