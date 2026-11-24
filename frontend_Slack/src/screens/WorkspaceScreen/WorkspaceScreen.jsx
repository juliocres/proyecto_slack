import { Link } from "react-router"
import { useWorkspace } from "../../context/WorkspaceContext"
import { useChannel } from "../../context/ChannelContext"
import { getCurrentUser } from "../../utils/authToken"
import WorkspaceSidebar from "../../Components/WorkspaceSidebar"
import ChannelMenu from "../../Components/ChannelMenu"
import "./WorkspaceScreen.css"

const AVATAR_COLORS = [
    "#f5498d",
    "#e8912d",
    "#2eb67d",
    "#36c5f0",
    "#7c3aed",
    "#e01e5a",
    "#1264a3",
    "#ecb22e",
]

function getInitial(nombre) {
    return nombre?.trim()?.charAt(0).toUpperCase() || "?"
}

function getInitials(nombre) {
    const words = nombre?.trim()?.split(/\s+/) ?? []

    const initials = words
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()

    return initials || "WS"
}

function getAvatarColor(nombre) {
    let hash = 0
    const texto = nombre || ""

    for (let i = 0; i < texto.length; i++) {
        hash = (hash * 31 + texto.charCodeAt(i)) >>> 0
    }

    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/*
El nombre del usuario se guarda en el payload del JWT al iniciar sesion.
Se decodifica solo para mostrar su inicial en la barra izquierda.
*/

/* --- Iconos de la barra fina de la izquierda --- */

function HomeIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
        </svg>
    )
}

function DirectMessageIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
    )
}

function ActivityIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
    )
}

function FilesIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-8l-2-2H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1Z" />
        </svg>
    )
}

function MoreIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
        </svg>
    )
}

function PlusIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}

/* --- Iconos del canal --- */

function StarIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2.5 15 9 22 9.7 16.8 14.5 18.2 21.5 12 18 5.8 21.5 7.2 14.5 2 9.7 9 9" />
        </svg>
    )
}

function HeadphonesIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
            <rect x="2.5" y="13" width="4.5" height="7" rx="2" />
            <rect x="17" y="13" width="4.5" height="7" rx="2" />
        </svg>
    )
}

function SearchIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    )
}

function SendIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
        </svg>
    )
}

/* --- Barra fina izquierda --- */

function WorkspaceRail() {
    const { workspace, workspace_loading } = useWorkspace()
    const current_user = getCurrentUser()

    const workspace_name = workspace?.nombre
        || (workspace_loading ? "..." : "Workspace")

    return (
        <nav className="workspace-rail" aria-label="Navegación principal">

            <Link
                to="/"
                className="workspace-rail-team"
                title={workspace_name}
                aria-label={`Volver al inicio. ${workspace_name}`}
            >
                {getInitials(workspace_name)}
            </Link>

            <Link to="/" className="workspace-rail-icon workspace-rail-icon--active" title="Inicio" aria-label="Inicio">
                <HomeIcon />
            </Link>

            <button type="button" className="workspace-rail-icon" title="Mensajes directos (próximamente)" aria-label="Mensajes directos" disabled>
                <DirectMessageIcon />
            </button>

            <button type="button" className="workspace-rail-icon" title="Actividad (próximamente)" aria-label="Actividad" disabled>
                <ActivityIcon />
            </button>

            <button type="button" className="workspace-rail-icon" title="Archivos (próximamente)" aria-label="Archivos" disabled>
                <FilesIcon />
            </button>

            <button type="button" className="workspace-rail-icon" title="Más (próximamente)" aria-label="Más" disabled>
                <MoreIcon />
            </button>

            <div className="workspace-rail-spacer" />

            <button type="button" className="workspace-rail-icon" title="Crear (próximamente)" aria-label="Crear" disabled>
                <PlusIcon />
            </button>

            <span
                className="workspace-rail-avatar"
                style={{ backgroundColor: getAvatarColor(current_user?.name || current_user?.email) }}
                title={current_user?.name || current_user?.email || "Usuario"}
            >
                {getInitial(current_user?.name || current_user?.email)}
            </span>

        </nav>
    )
}

/* --- Encabezado del canal seleccionado --- */

function ChannelHeader() {
    const { members, current_role } = useWorkspace()
    const { selected_channel } = useChannel()

    const channel_name = selected_channel?.nombre || "canal"

    //Solo owners/admins pueden editar o eliminar canales (mismo criterio que el backend)
    const can_manage_channel = current_role === "owner" || current_role === "admin"

    return (
        <header className="workspace-channel-header">

            <button
                type="button"
                className="workspace-channel-icon-button"
                title="Destacar canal (próximamente)"
                aria-label="Destacar canal"
                disabled
            >
                <StarIcon />
            </button>

            <h1 className="workspace-channel-title">
                <span className="workspace-channel-hash" aria-hidden="true">#</span>
                {channel_name}
            </h1>

            {
                selected_channel?.descripcion
                &&
                <span className="workspace-channel-description">
                    {selected_channel.descripcion}
                </span>
            }

            <div className="workspace-channel-header-actions">

                <div className="workspace-channel-members" aria-label={`${members.length} miembros`}>
                    {
                        members.slice(0, 3).map(
                            member => (
                                <span
                                    key={member.member_id}
                                    className="workspace-channel-member-avatar"
                                    style={{ backgroundColor: getAvatarColor(member.nombre) }}
                                    title={`${member.nombre} · ${member.member_rol}`}
                                >
                                    {getInitial(member.nombre)}
                                </span>
                            )
                        )
                    }
                </div>

                <span className="workspace-channel-member-count">
                    {members.length}
                </span>

                <button type="button" className="workspace-channel-icon-button" title="Huddle (próximamente)" aria-label="Huddle" disabled>
                    <HeadphonesIcon />
                </button>

                <button type="button" className="workspace-channel-icon-button" title="Buscar en el canal (próximamente)" aria-label="Buscar en el canal" disabled>
                    <SearchIcon />
                </button>

                <ChannelMenu can_manage={can_manage_channel} />

            </div>

        </header>
    )
}

function ChannelTabs() {
    return (
        <div className="workspace-channel-tabs">
            <span className="workspace-channel-tab workspace-channel-tab--active">
                Mensajes
            </span>
            <span className="workspace-channel-tab workspace-channel-tab--muted">
                Agregar canvas
            </span>
            <span className="workspace-channel-tab-plus" aria-hidden="true">+</span>
        </div>
    )
}

/* --- Contenido central del canal --- */

function ChannelContent() {
    const {
        channels,
        selected_channel,
        channels_loading,
        channels_error,
        reloadChannels
    } = useChannel()

    if (channels_loading) {
        return (
            <div className="workspace-channel-feedback" aria-live="polite">
                <span className="workspace-channel-spinner" aria-hidden="true" />
                <p>Cargando canales...</p>
            </div>
        )
    }

    if (channels_error) {
        return (
            <div className="workspace-channel-feedback">
                <span className="workspace-channel-feedback-icon" aria-hidden="true">!</span>
                <h2>No pudimos cargar los canales</h2>
                <p>{channels_error}</p>
                <button type="button" className="workspace-channel-retry" onClick={reloadChannels}>
                    Reintentar
                </button>
            </div>
        )
    }

    if (channels.length === 0) {
        return (
            <div className="workspace-channel-feedback">
                <span className="workspace-channel-feedback-icon workspace-channel-feedback-icon--hash" aria-hidden="true">#</span>
                <h2>Este espacio de trabajo todavía no tiene canales</h2>
                <p>Cuando se cree el primer canal, va a aparecer en la barra lateral.</p>
            </div>
        )
    }

    if (!selected_channel) {
        return (
            <div className="workspace-channel-feedback">
                <span className="workspace-channel-feedback-icon workspace-channel-feedback-icon--hash" aria-hidden="true">#</span>
                <h2>Elegí un canal</h2>
                <p>Seleccioná un canal de la barra lateral para ver su contenido.</p>
            </div>
        )
    }

    const channel_description = selected_channel.descripcion?.trim()

    return (
        <div className="workspace-channel-welcome">

            <div className="workspace-channel-welcome-hero">
                <span className="workspace-channel-welcome-icon" aria-hidden="true">#</span>
                <div className="workspace-channel-welcome-text">
                    <h2>
                        Todos están aquí en #{selected_channel.nombre}
                    </h2>
                    <p>
                        {
                            channel_description
                                ? channel_description
                                : `Este es el comienzo del canal #${selected_channel.nombre}.`
                        }
                    </p>
                </div>
            </div>

            <div className="workspace-channel-start-card">
                <span className="workspace-channel-start-icon" aria-hidden="true">💬</span>
                <div>
                    <h3>Aún no hay mensajes</h3>
                    <p>
                        Cuando tu equipo empiece a conversar, los mensajes van a aparecer acá.
                    </p>
                </div>
            </div>

        </div>
    )
}

/* --- Caja de mensaje (visual: el envío todavía no está implementado) --- */

function MessageComposer() {
    const { selected_channel } = useChannel()

    if (!selected_channel) {
        return null
    }

    return (
        <div className="workspace-composer">
            <div className="workspace-composer-box">

                <div className="workspace-composer-toolbar" aria-hidden="true">
                    <span>B</span>
                    <span className="workspace-composer-toolbar-italic">I</span>
                    <span className="workspace-composer-toolbar-underline">U</span>
                    <span className="workspace-composer-toolbar-divider" />
                    <span>🔗</span>
                    <span>☺</span>
                </div>

                <textarea
                    className="workspace-composer-input"
                    placeholder={`Enviar un mensaje a #${selected_channel.nombre}`}
                    rows={2}
                    readOnly
                    aria-label={`Enviar un mensaje a #${selected_channel.nombre}`}
                />

                <div className="workspace-composer-actions">
                    <span className="workspace-composer-soon">
                        El envío de mensajes estará disponible próximamente
                    </span>
                    <button
                        type="button"
                        className="workspace-composer-send"
                        title="Enviar mensaje (próximamente)"
                        aria-label="Enviar mensaje"
                        disabled
                    >
                        <SendIcon />
                    </button>
                </div>

            </div>
        </div>
    )
}

/* --- Pantalla completa --- */

function WorkspaceScreen() {

    const { workspace, workspace_loading, workspace_error, reloadWorkspace } = useWorkspace()

    if (workspace_error && !workspace) {
        return (
            <main className="workspace-screen workspace-screen--error">
                <div className="workspace-error-card">
                    <h1>No pudimos abrir el espacio de trabajo</h1>
                    <p>{workspace_error}</p>
                    <div className="workspace-error-actions">
                        <button type="button" onClick={reloadWorkspace}>
                            Reintentar
                        </button>
                        <Link to="/">Volver al inicio</Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="workspace-screen">
            <WorkspaceRail />
            <WorkspaceSidebar />

            <section className="workspace-main" aria-label="Contenido del canal">
                <ChannelHeader />
                <ChannelTabs />
                <div className="workspace-channel-body">
                    {
                        workspace_loading && !workspace
                            ? (
                                <div className="workspace-channel-feedback" aria-live="polite">
                                    <span className="workspace-channel-spinner" aria-hidden="true" />
                                    <p>Cargando espacio de trabajo...</p>
                                </div>
                            )
                            : <ChannelContent />
                    }
                </div>
                <MessageComposer />
            </section>
        </main>
    )
}

export default WorkspaceScreen
