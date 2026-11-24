import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useWorkspace } from "../context/WorkspaceContext"
import { clearAuthToken } from "../utils/authToken"
import { getAvatarColor, getInitial } from "../utils/avatar"
import "./UserProfileMenu.css"

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}

function LogoutIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    )
}

/*
Menu desplegable del avatar del usuario en la barra lateral izquierda (estilo Slack).
Al hacer click sobre la imagen del contacto se abre con:
    - Encabezado con nombre y estado de disponibilidad
    - Perfil (abre el panel lateral estilo Slack con informacion y hora local en vivo)
    - Cerrar sesion (borra el auth_token y redirige a /login)
*/
export default function UserProfileMenu({ is_available, onOpenProfile }) {

    const { current_user, current_membership } = useWorkspace()
    const navigate = useNavigate()

    const [menu_open, setMenuOpen] = useState(false)
    const menu_ref = useRef(null)

    const display_name = current_membership?.nombre || current_user?.name || "Usuario"
    const display_key = current_membership?.nombre || current_user?.name || current_user?.email
    const avatar_color = getAvatarColor(display_key)
    const avatar_initial = getInitial(display_key)

    //Cerrar el menu al hacer click fuera o al presionar Escape
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

    function handleOpenProfile() {
        setMenuOpen(false)
        onOpenProfile()
    }

    function handleLogout() {
        setMenuOpen(false)
        clearAuthToken()
        navigate("/login", { replace: true })
    }

    return (
        <div className="user-profile-menu" ref={menu_ref}>

            <button
                type="button"
                className={
                    `user-profile-trigger${menu_open ? " user-profile-trigger--open" : ""}`
                }
                style={{ backgroundColor: avatar_color }}
                title={`${display_name} (${is_available ? "Disponible" : "Ausente"})`}
                aria-label={`Menú de usuario de ${display_name}`}
                aria-haspopup="menu"
                aria-expanded={menu_open}
                onClick={() => setMenuOpen(open => !open)}
            >
                <span>{avatar_initial}</span>
                <span
                    className={
                        `user-profile-trigger-status${is_available ? " user-profile-trigger-status--online" : ""}`
                    }
                    aria-hidden="true"
                />
            </button>

            {
                menu_open
                &&
                <div className="user-profile-dropdown" role="menu">

                    <div className="user-profile-dropdown-header">
                        <span
                            className="user-profile-dropdown-avatar"
                            style={{ backgroundColor: avatar_color }}
                            aria-hidden="true"
                        >
                            {avatar_initial}
                        </span>

                        <div className="user-profile-dropdown-identity">
                            <strong className="user-profile-dropdown-name">
                                {display_name}
                            </strong>
                            <span className="user-profile-dropdown-status">
                                <span
                                    className={
                                        `user-profile-status-dot${is_available ? " user-profile-status-dot--online" : ""}`
                                    }
                                    aria-hidden="true"
                                />
                                {is_available ? "Disponible" : "Ausente"}
                            </span>
                        </div>
                    </div>

                    <div className="user-profile-dropdown-divider" />

                    <button
                        type="button"
                        className="user-profile-dropdown-item"
                        role="menuitem"
                        onClick={handleOpenProfile}
                    >
                        <UserIcon />
                        Perfil
                    </button>

                    <div className="user-profile-dropdown-divider" />

                    <button
                        type="button"
                        className="user-profile-dropdown-item user-profile-dropdown-item--danger"
                        role="menuitem"
                        onClick={handleLogout}
                    >
                        <LogoutIcon />
                        Cerrar sesión
                    </button>

                </div>
            }

        </div>
    )
}
