import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { getChannelsByWorkspace } from "../services/channelService"
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

    const value = {
        workspace_id,
        channels,
        selected_channel,
        selected_channel_id,
        selectChannel,
        channels_loading: loading,
        channels_error: error,
        reloadChannels
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
