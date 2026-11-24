import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
    getChannelsByWorkspace,
    createChannel as createChannelRequest,
    updateChannel as updateChannelRequest,
    deleteChannel as deleteChannelRequest
} from "../services/channelService"
import { useWorkspace } from "./WorkspaceContext"

/*
Este contexto vive dentro del WorkspaceProvider (ruta /workspace/:workspace_id).

Responsabilidades:
    - traer los canales del workspace (GET /api/workspaces/:workspace_id/channels)
    - guardar el canal seleccionado
    - exponer loading/error y una funcion para recargar

El ChannelList consume este contexto para pintar la lista y cambiar de canal.
Los mensajes del canal se agregaran en una siguiente etapa (ChannelMessages).
*/

export const ChannelContext = createContext(null)

export function ChannelProvider({ children }) {

    const { workspace_id } = useWorkspace()

    //Lista de canales que devolvio el backend para el workspace actual
    const [channels_state, setChannelsState] = useState([])

    //Sirve para no mostrar canales viejos mientras se carga otro workspace
    const [loaded_workspace_id, setLoadedWorkspaceId] = useState(null)

    const [selected_channel_id, setSelectedChannelId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    //Estado de la creacion de un canal (POST /channels)
    const [creating, setCreating] = useState(false)
    const [create_error, setCreateError] = useState(null)

    //Estado de la edicion (PUT /channels/:id) y eliminacion (DELETE /channels/:id)
    const [updating, setUpdating] = useState(false)
    const [update_error, setUpdateError] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [delete_error, setDeleteError] = useState(null)

    //Cambiar este contador vuelve a disparar el useEffect de carga
    const [reload_counter, setReloadCounter] = useState(0)

    const channels = useMemo(
        () => (
            loaded_workspace_id === workspace_id
                ? channels_state
                : []
        ),
        [loaded_workspace_id, workspace_id, channels_state]
    )

    useEffect(
        () => {
            if (!workspace_id) {
                return
            }

            let cancelled = false

            async function loadChannels() {
                setLoading(true)
                setError(null)
                setLoadedWorkspaceId(workspace_id)
                setChannelsState([])
                setSelectedChannelId(null)

                try {
                    const response = await getChannelsByWorkspace(workspace_id)

                    if (cancelled) {
                        return
                    }

                    const channel_list = response?.data?.channels

                    setChannelsState(
                        Array.isArray(channel_list) ? channel_list : []
                    )
                }
                catch (request_error) {
                    if (cancelled) {
                        return
                    }

                    setError(request_error.message)
                    setChannelsState([])
                }
                finally {
                    if (!cancelled) {
                        setLoading(false)
                    }
                }
            }

            loadChannels()

            //Si el workspace cambia antes de que termine la request, ignoramos la respuesta vieja
            return () => {
                cancelled = true
            }
        },
        [workspace_id, reload_counter]
    )

    /*
    Si el canal seleccionado ya no existe (o todavia no hay seleccion),
    elegimos el primero de la lista. Usamos la forma funcional de setState
    para no depender de selected_channel_id en las dependencias.
    */
    useEffect(
        () => {
            if (channels.length === 0) {
                setSelectedChannelId(null)
                return
            }

            setSelectedChannelId(
                current_channel_id => (
                    channels.some(channel => channel._id === current_channel_id)
                        ? current_channel_id
                        : channels[0]._id
                )
            )
        },
        [channels]
    )

    const selected_channel = useMemo(
        () => (
            channels.find(channel => channel._id === selected_channel_id) ?? null
        ),
        [channels, selected_channel_id]
    )

    function selectChannel(channel_id) {
        setSelectedChannelId(channel_id)
    }

    function reloadChannels() {
        setReloadCounter(counter => counter + 1)
    }

    function clearCreateError() {
        setCreateError(null)
    }

    function clearUpdateError() {
        setUpdateError(null)
    }

    function clearDeleteError() {
        setDeleteError(null)
    }

    /*
    Crea un canal en el backend y, si sale bien, lo agrega a la lista local
    y lo deja seleccionado (sin esperar a una nueva carga completa).
    Devuelve el canal creado o null si hubo un error.
    */
    async function createChannel(name, description) {
        if (!workspace_id) {
            return null
        }

        setCreating(true)
        setCreateError(null)

        try {
            const response = await createChannelRequest(
                workspace_id,
                name,
                description
            )

            const channel_created = response?.data?.channel_created ?? null

            if (channel_created) {
                setLoadedWorkspaceId(workspace_id)

                setChannelsState(
                    current_channels => (
                        current_channels.some(
                            channel => channel._id === channel_created._id
                        )
                            ? current_channels
                            : [...current_channels, channel_created]
                    )
                )

                setSelectedChannelId(channel_created._id)
            }

            return channel_created
        }
        catch (request_error) {
            setCreateError(request_error.message)
            return null
        }
        finally {
            setCreating(false)
        }
    }

    /*
    Edita un canal en el backend y actualiza la lista local.
    Devuelve el canal actualizado o null si hubo un error.
    */
    async function updateChannel(channel_id, name, description) {
        if (!workspace_id || !channel_id) {
            return null
        }

        setUpdating(true)
        setUpdateError(null)

        try {
            const response = await updateChannelRequest(
                workspace_id,
                channel_id,
                name,
                description
            )

            const channel_updated = response?.data?.channel_updated ?? null

            if (channel_updated) {
                setChannelsState(
                    current_channels => current_channels.map(
                        channel => (
                            channel._id === channel_updated._id
                                ? channel_updated
                                : channel
                        )
                    )
                )
            }

            return channel_updated
        }
        catch (request_error) {
            setUpdateError(request_error.message)
            return null
        }
        finally {
            setUpdating(false)
        }
    }

    /*
    Elimina un canal en el backend y lo saca de la lista local.
    El useEffect de seleccion elige otro canal (o ninguno) automaticamente.
    Devuelve true si se elimino, false si hubo un error.
    */
    async function deleteChannel(channel_id) {
        if (!workspace_id || !channel_id) {
            return false
        }

        setDeleting(true)
        setDeleteError(null)

        try {
            await deleteChannelRequest(workspace_id, channel_id)

            setChannelsState(
                current_channels => current_channels.filter(
                    channel => channel._id !== channel_id
                )
            )

            return true
        }
        catch (request_error) {
            setDeleteError(request_error.message)
            return false
        }
        finally {
            setDeleting(false)
        }
    }

    const value = {
        workspace_id,
        channels,
        selected_channel,
        selected_channel_id,
        selectChannel,
        channels_loading: loading,
        channels_error: error,
        reloadChannels,
        createChannel,
        channel_creating: creating,
        channel_create_error: create_error,
        clearCreateError,
        updateChannel,
        channel_updating: updating,
        channel_update_error: update_error,
        clearUpdateError,
        deleteChannel,
        channel_deleting: deleting,
        channel_delete_error: delete_error,
        clearDeleteError
    }

    return (
        <ChannelContext.Provider value={value}>
            {children}
        </ChannelContext.Provider>
    )
}

export function useChannel() {
    const context = useContext(ChannelContext)

    if (!context) {
        throw new Error('useChannel debe usarse dentro de un ChannelProvider')
    }

    return context
}
