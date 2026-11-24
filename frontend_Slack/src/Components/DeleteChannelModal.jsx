import { useEffect } from "react"
import { useChannel } from "../context/ChannelContext"
import "./DeleteChannelModal.css"

function TrashIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    )
}

/*
Confirmacion para eliminar un canal.
El DELETE lo hace el ChannelContext; al terminar, el contexto saca el canal
de la lista y selecciona otro automaticamente.
*/
export default function DeleteChannelModal({ channel, onClose }) {

    const {
        deleteChannel,
        channel_deleting,
        channel_delete_error,
        clearDeleteError
    } = useChannel()

    useEffect(
        () => {
            clearDeleteError()
        },
        []
    )

    useEffect(
        () => {
            function handleKeyDown(event) {
                if (event.key === "Escape" && !channel_deleting) {
                    onClose()
                }
            }

            document.addEventListener("keydown", handleKeyDown)

            return () => document.removeEventListener("keydown", handleKeyDown)
        },
        [onClose, channel_deleting]
    )

    async function handleConfirm() {
        const deleted = await deleteChannel(channel._id)

        if (deleted) {
            onClose()
        }
    }

    return (
        <div
            className="delete-channel-overlay"
            onMouseDown={
                event => {
                    if (event.target === event.currentTarget && !channel_deleting) {
                        onClose()
                    }
                }
            }
        >
            <div
                className="delete-channel-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-channel-title"
            >

                <span className="delete-channel-icon" aria-hidden="true">
                    <TrashIcon />
                </span>

                <h2 id="delete-channel-title" className="delete-channel-title">
                    Eliminar canal
                </h2>

                <p className="delete-channel-text">
                    ¿Seguro que querés eliminar <strong>#{channel.nombre}</strong>?
                    Se van a borrar también sus mensajes y esta acción no se puede deshacer.
                </p>

                {
                    channel_delete_error
                    &&
                    <div className="delete-channel-error" role="alert">
                        {channel_delete_error}
                    </div>
                }

                <footer className="delete-channel-actions">
                    <button
                        type="button"
                        className="delete-channel-button delete-channel-button--cancel"
                        onClick={onClose}
                        disabled={channel_deleting}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="delete-channel-button delete-channel-button--confirm"
                        onClick={handleConfirm}
                        disabled={channel_deleting}
                    >
                        {
                            channel_deleting
                                ? "Eliminando..."
                                : "Eliminar"
                        }
                    </button>
                </footer>

            </div>
        </div>
    )
}
