import { useEffect, useState } from "react"
import { useWorkspace } from "../context/WorkspaceContext"
import { getAvatarColor, getInitial } from "../utils/avatar"
import "./UserProfilePanel.css"

const ROLE_LABELS = {
    owner: "Propietario",
    admin: "Administrador",
    user: "Miembro",
}

function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
    )
}

function ClockIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15.5 14" />
        </svg>
    )
}

function MailIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <polyline points="3 7 12 13 21 7" />
        </svg>
    )
}

function WorkspaceIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    )
}

function CalendarIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}

function formatLocalTime(date) {
    return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date)
}

function getLocalTimezoneLabel() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    }
    catch {
        return ""
    }
}

function formatMemberSince(iso_date) {
    if (!iso_date) {
        return null
    }

    const parsed_date = new Date(iso_date)

    if (Number.isNaN(parsed_date.getTime())) {
        return null
    }

    return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(parsed_date)
}

/*
Panel lateral derecho de perfil del usuario (estilo Slack).
Muestra:
    - Avatar grande, nombre y rol en el workspace
    - Estado de disponibilidad (Disponible / Ausente) con boton para cambiarlo
    - Hora local real del usuario actualizada en vivo cada segundo
    - Informacion de contacto (email, workspace y fecha de ingreso)
*/
export default function UserProfilePanel({ is_available, onToggleAvailability, onClose }) {

    const { current_user, current_membership, current_role, workspace } = useWorkspace()

    //Reloj en vivo actualizado cada segundo para mostrar la hora real local
    const [current_time, setCurrentTime] = useState(() => new Date())

    useEffect(
        () => {
            const interval_id = setInterval(
                () => {
                    setCurrentTime(new Date())
                },
                1000
            )

            return () => clearInterval(interval_id)
        },
        []
    )

    //Cerrar el panel con Escape
    useEffect(
        () => {
            function handleKeyDown(event) {
                if (event.key === "Escape") {
                    onClose()
                }
            }

            document.addEventListener("keydown", handleKeyDown)

            return () => document.removeEventListener("keydown", handleKeyDown)
        },
        [onClose]
    )

    const display_name = current_membership?.nombre || current_user?.name || "Usuario"
    const display_email = current_membership?.email || current_user?.email || "Sin correo registrado"
    const display_key = current_membership?.nombre || current_user?.name || current_user?.email
    const avatar_color = getAvatarColor(display_key)
    const avatar_initial = getInitial(display_key)

    const role_label = ROLE_LABELS[current_role] || "Miembro"
    const member_since = formatMemberSince(current_membership?.fecha_creacion)
    const timezone_label = getLocalTimezoneLabel()
    const formatted_time = formatLocalTime(current_time)

    return (
        <aside className="user-profile-panel" aria-label="Perfil del usuario">

            <header className="user-profile-panel-header">
                <h2 className="user-profile-panel-title">Perfil</h2>

                <button
                    type="button"
                    className="user-profile-panel-close"
                    onClick={onClose}
                    aria-label="Cerrar perfil"
                    title="Cerrar"
                >
                    <CloseIcon />
                </button>
            </header>

            <div className="user-profile-panel-body">

                <div className="user-profile-panel-hero">
                    <div
                        className="user-profile-panel-avatar"
                        style={{ backgroundColor: avatar_color }}
                        aria-hidden="true"
                    >
                        {avatar_initial}
                    </div>
                </div>

                <div className="user-profile-panel-identity">
                    <h3 className="user-profile-panel-name">
                        {display_name}
                    </h3>

                    <span className="user-profile-panel-role">
                        {role_label}
                    </span>
                </div>

                <div className="user-profile-panel-meta">
                    <div className="user-profile-panel-meta-row">
                        <span
                            className={
                                `user-profile-panel-dot${is_available ? " user-profile-panel-dot--online" : ""}`
                            }
                            aria-hidden="true"
                        />
                        <span className="user-profile-panel-meta-text">
                            {is_available ? "Disponible" : "Ausente"}
                        </span>
                    </div>

                    <div className="user-profile-panel-meta-row">
                        <span className="user-profile-panel-meta-icon" aria-hidden="true">
                            <ClockIcon />
                        </span>
                        <div className="user-profile-panel-clock">
                            <span className="user-profile-panel-meta-text">
                                {formatted_time} hora local
                            </span>
                            {
                                timezone_label
                                &&
                                <span className="user-profile-panel-timezone">
                                    {timezone_label}
                                </span>
                            }
                        </div>
                    </div>
                </div>

                <div className="user-profile-panel-actions">
                    <button
                        type="button"
                        className="user-profile-panel-status-btn"
                        onClick={onToggleAvailability}
                    >
                        {
                            is_available
                                ? "Establecer como ausente"
                                : "Establecer como disponible"
                        }
                    </button>
                </div>

                <div className="user-profile-panel-divider" />

                <section className="user-profile-panel-section" aria-label="Información de contacto">
                    <h4 className="user-profile-panel-section-title">
                        Información de contacto
                    </h4>

                    <div className="user-profile-panel-info-item">
                        <span className="user-profile-panel-info-icon" aria-hidden="true">
                            <MailIcon />
                        </span>
                        <div className="user-profile-panel-info-content">
                            <span className="user-profile-panel-info-label">
                                Dirección de correo electrónico
                            </span>
                            <a
                                className="user-profile-panel-info-link"
                                href={`mailto:${display_email}`}
                            >
                                {display_email}
                            </a>
                        </div>
                    </div>

                    {
                        workspace?.nombre
                        &&
                        <div className="user-profile-panel-info-item">
                            <span className="user-profile-panel-info-icon" aria-hidden="true">
                                <WorkspaceIcon />
                            </span>
                            <div className="user-profile-panel-info-content">
                                <span className="user-profile-panel-info-label">
                                    Espacio de trabajo
                                </span>
                                <span className="user-profile-panel-info-value">
                                    {workspace.nombre}
                                </span>
                            </div>
                        </div>
                    }

                    {
                        member_since
                        &&
                        <div className="user-profile-panel-info-item">
                            <span className="user-profile-panel-info-icon" aria-hidden="true">
                                <CalendarIcon />
                            </span>
                            <div className="user-profile-panel-info-content">
                                <span className="user-profile-panel-info-label">
                                    Miembro desde
                                </span>
                                <span className="user-profile-panel-info-value">
                                    {member_since}
                                </span>
                            </div>
                        </div>
                    }
                </section>

            </div>

        </aside>
    )
}
