const API_URL = import.meta.env.VITE_APP_URL_BACKEND

/*
Canales de un espacio de trabajo:
GET /api/workspaces/:workspace_id/channels
Requiere que el usuario autenticado sea miembro del workspace.
*/
export async function getChannelsByWorkspace(workspace_id) {
    const auth_token = localStorage.getItem('auth_token')

    const response_http = await fetch(
        API_URL + `/api/workspaces/${workspace_id}/channels`,
        {
            method: 'GET',
            headers: {
                'Authorization': `bearer ${auth_token}`
            }
        }
    )

    const response_body = await response_http.json()

    if (!response_body.ok) {
        throw new Error(response_body.message)
    }

    return response_body
}
