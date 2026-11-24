import { createContext, useContext, useEffect } from "react"
import { useParams } from "react-router"
import useRequest from "../hooks/useRequest"
import { getWorkspaceById, getWorkspaceMembers } from "../services/workspaceService"
import { getCurrentUser } from "../utils/authToken"

/*
Este contexto vive a nivel de la ruta /workspace/:workspace_id.
Guarda los datos del espacio de trabajo (GET /api/workspaces/:workspace_id)
y la lista de membresias (GET /api/workspaces/:workspace_id/members),
usando useRequest para manejar loading, response y error de cada consulta.
*/

export const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {

    const { workspace_id } = useParams()

    //Un useRequest por cada API, asi cada una tiene su propio estado
    const {
        loading: workspace_loading,
        response: workspace_response,
        error: workspace_error,
        sendRequest: sendWorkspaceRequest
    } = useRequest()

    const {
        loading: members_loading,
        response: members_response,
        error: members_error,
        sendRequest: sendMembersRequest
    } = useRequest()

    const loading = workspace_loading || members_loading
    const error = workspace_error || members_error

    function fetchWorkspaceData() {
        sendWorkspaceRequest(
            () => getWorkspaceById(workspace_id)
        )
        sendMembersRequest(
            () => getWorkspaceMembers(workspace_id)
        )
    }

    //Se vuelve a consultar cada vez que cambia el workspace_id de la ruta
    useEffect(
        () => {
            fetchWorkspaceData()
        },
        [workspace_id]
    )

    //Mostrar por consola el estado de las APIs y el estado de carga
    useEffect(
        () => {
            console.log(`[WorkspaceContext] workspace_id: ${workspace_id}`)
            console.log('[WorkspaceContext] workspace:', {
                loading: workspace_loading,
                response: workspace_response,
                error: workspace_error
            })
            console.log('[WorkspaceContext] members:', {
                loading: members_loading,
                response: members_response,
                error: members_error
            })
            console.log('[WorkspaceContext] loading general:', loading)
        },
        [
            workspace_id,
            workspace_loading,
            workspace_response,
            workspace_error,
            members_loading,
            members_response,
            members_error,
            loading
        ]
    )

    /*
    El rol del usuario actual dentro del workspace sale de su membresia.
    Se usa, por ejemplo, para mostrar las acciones de administrar canales
    solo a owners/admins.
    Se busca por user_id (y por email como respaldo) porque member_id es el
    id de la membresia, no del usuario.
    */
    const members = members_response?.data?.members ?? []
    const current_user = getCurrentUser()
    const current_membership = members.find(
        member => (
            (member.user_id && current_user?.id && String(member.user_id) === String(current_user.id))
            || (
                member.email
                && current_user?.email
                && member.email.toLowerCase() === current_user.email.toLowerCase()
            )
        )
    ) ?? null
    const current_role = current_membership?.member_rol ?? null

    const value = {
        workspace_id,
        workspace: workspace_response?.data?.workspace_selected ?? null,
        members: members,
        current_user: current_user,
        current_membership: current_membership,
        current_role: current_role,
        loading,
        error,
        workspace_loading,
        workspace_error,
        members_loading,
        members_error,
        reloadWorkspace: fetchWorkspaceData
    }

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)

    if (!context) {
        throw new Error('useWorkspace debe usarse dentro de un WorkspaceProvider')
    }

    return context
}
