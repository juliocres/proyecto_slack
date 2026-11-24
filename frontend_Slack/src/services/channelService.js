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

/*
Crear un canal:
POST /api/workspaces/:workspace_id/channels
body: { name, description }
*/
export async function createChannel(workspace_id, name, description) {
    const auth_token = localStorage.getItem('auth_token')

    const response_http = await fetch(
        API_URL + `/api/workspaces/${workspace_id}/channels`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `bearer ${auth_token}`
            },
            body: JSON.stringify({
                name: name,
                description: description
            })
        }
    )

    const response_body = await response_http.json()

    if (!response_body.ok) {
        throw new Error(response_body.message)
    }

    return response_body
}

/*
Editar un canal:
PUT /api/workspaces/:workspace_id/channels/:channel_id
body: { name, description }
*/
export async function updateChannel(workspace_id, channel_id, name, description) {
    const auth_token = localStorage.getItem('auth_token')

    const response_http = await fetch(
        API_URL + `/api/workspaces/${workspace_id}/channels/${channel_id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `bearer ${auth_token}`
            },
            body: JSON.stringify({
                name: name,
                description: description
            })
        }
    )

    const response_body = await response_http.json()

    if (!response_body.ok) {
        throw new Error(response_body.message)
    }

    return response_body
}

/*
Eliminar un canal:
DELETE /api/workspaces/:workspace_id/channels/:channel_id
*/
export async function deleteChannel(workspace_id, channel_id) {
    const auth_token = localStorage.getItem('auth_token')

    const response_http = await fetch(
        API_URL + `/api/workspaces/${workspace_id}/channels/${channel_id}`,
        {
            method: 'DELETE',
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
