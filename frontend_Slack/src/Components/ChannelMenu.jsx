import { useEffect, useRef, useState } from "react"
import { useChannel } from "../context/ChannelContext"
import ChannelFormModal from "./ChannelFormModal"
import DeleteChannelModal from "./DeleteChannelModal"
import "./ChannelMenu.css"

function MoreIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
        </svg>
    )
}

function EditIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    )
}

function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    )
}

/*
Menu "..." del encabezado del canal.
Se despliega con las acciones de administrar el canal:
    - Editar canal (nombre y descripcion)
    - Eliminar canal (con confirmacion)

Solo se habilita para owners/admins del workspace, que son los roles que
el backend acepta para PUT y DELETE de canales.
*/
export default function ChannelMenu({ can_manage }) {

    const { selected_channel } = useChannel()

    const [menu_open, setMenuOpen] = useState(false)
    const [edit_modal_open, setEditModalOpen] = useState(false)
    const [delete_modal_open, setDeleteModalOpen] = useState(false)

    const menu_ref = useRef(null)

    //Cerrar el menu al hacer click fuera o con Escape
    useEffect(
        () => {
            if (!menu_open) {
                return
            }

            function handleMouseDown(event) {
                if (menu_ref.current && !menu_ref.current.contains(event.target)) {
                    setMenuOpen(false)
                }
            }

            function handleKeyDown(event) {
                if (event.key === "Escape") {
                    setMenuOpen(false)
                }
            }

            document.addEventListener("mousedown", handleMouseDown)
            document.addEventListener("keydown", handleKeyDown)

            return () => {
                document.removeEventListener("mousedown", handleMouseDown)
                document.removeEventListener("keydown", handleKeyDown)
            }
        },
        [menu_open]
    )

    //Cerrar el menu desplegable si cambia el canal seleccionado
    useEffect(
        () => {
            setMenuOpen(false)
        },
        [selected_channel?._id]
    )

    if (!selected_channel) {
        return null
    }

    function openEditModal() {
        setMenuOpen(false)
        setEditModalOpen(true)
    }

    function openDeleteModal() {
        setMenuOpen(false)
        setDeleteModalOpen(true)
    }

    return (
        <div className="channel-menu" ref={menu_ref}>

            <button
                type="button"
                className={
                    `workspace-channel-icon-button${menu_open ? " channel-menu-trigger--open" : ""}`
                }
                title={
                    can_manage
                        ? "Más acciones"
                        : "Solo owners y admins pueden administrar el canal"
                }
                aria-label="Más acciones"
                aria-haspopup="menu"
                aria-expanded={menu_open}
                onClick={() => setMenuOpen(open => !open)}
                disabled={!can_manage}
            >
                <MoreIcon />
            </button>

            {
                menu_open
                &&
                can_manage
                &&
                <div className="channel-menu-dropdown" role="menu">

                    <button
                        type="button"
                        className="channel-menu-item"
                        role="menuitem"
                        onClick={openEditModal}
                    >
                        <EditIcon />
                        Editar canal
                    </button>

                    <button
                        type="button"
                        className="channel-menu-item channel-menu-item--danger"
                        role="menuitem"
                        onClick={openDeleteModal}
                    >
                        <TrashIcon />
                        Eliminar canal
                    </button>

                </div>
            }

            {
                edit_modal_open
                &&
                <ChannelFormModal
                    key={selected_channel._id}
                    channel={selected_channel}
                    onClose={() => setEditModalOpen(false)}
                />
            }

            {
                delete_modal_open
                &&
                <DeleteChannelModal
                    key={selected_channel._id}
                    channel={selected_channel}
                    onClose={() => setDeleteModalOpen(false)}
                />
            }

        </div>
    )
}
