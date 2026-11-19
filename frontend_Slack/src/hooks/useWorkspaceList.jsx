import { useEffect } from "react"
import useRequest from "./useRequest"
import { getAllWorkspaces } from "../services/workspaceService"

function useWorkspaceList() {
    const {response, error, loading, sendRequest} = useRequest()

//con este efecto me aseguro de que la funcion getAllWorkspaces se ejecute una sola vez cuando se renderiza el componente por primera vez
    useEffect(
    () => {
        sendRequest(
        () => getAllWorkspaces()
        )
    },
    []
    )

    //Estado de la API por consola para poder diagnosticar problemas
    useEffect(
    () => {
        console.log('[useWorkspaceList] loading:', loading)
        console.log('[useWorkspaceList] error:', error)
        console.log('[useWorkspaceList] response:', response)
    },
    [loading, error, response]
    )
    function reloadWorkspaces(){
        sendRequest(
            () => getAllWorkspaces()
        )
    }
    return {
        workspaces_response : response,
        workspaces_error : error,
        workspaces_loading : loading,
        reloadWorkspaces
    }
}

export default useWorkspaceList