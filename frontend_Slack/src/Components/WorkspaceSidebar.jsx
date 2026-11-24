import { useWorkspace } from "../context/WorkspaceContext"
import ChannelList from "./ChannelList"
import "./WorkspaceSidebar.css"

function ChevronDownIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    )
}

function SettingsIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.47.63.86.72H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    )
}

function ComposeIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    )
}

function SearchIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    )
}

function ThreadsIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
    )
}

function MeetIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 10l4.6-2.6A1 1 0 0 1 21 8.3v7.4a1 1 0 0 1-1.4.9L15 14" />
            <rect x="3" y="6" width="12" height="12" rx="2" />
        </svg>
    )
}

function DirectoryIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="9" y1="4" x2="9" y2="20" />
            <line x1="13" y1="9" x2="17" y2="9" />
            <line x1="13" y1="13" x2="17" y2="13" />
        </svg>
    )
}

const SIDEBAR_ITEMS = [
    { label: "Hilos de tus conversaciones", icon: <ThreadsIcon /> },
    { label: "Juntas", icon: <MeetIcon /> },
    { label: "Directorio", icon: <DirectoryIcon /> },
]

export default function WorkspaceSidebar() {

    const { workspace, workspace_loading } = useWorkspace()

    const workspace_name = workspace?.nombre
        || (workspace_loading ? "Cargando..." : "Espacio de trabajo")

    return (
        <aside className="workspace-sidebar" aria-label="Barra lateral del espacio de trabajo">

            <header className="workspace-sidebar-header">
                <button
                    type="button"
                    className="workspace-sidebar-name-button"
                    title={workspace_name}
                >
                    <span className="workspace-sidebar-name">
                        {workspace_name}
                    </span>
                    <ChevronDownIcon />
                </button>

                <div className="workspace-sidebar-header-actions">
                    <button type="button" className="workspace-sidebar-icon-button" title="Configuración (próximamente)" aria-label="Configuración" disabled>
                        <SettingsIcon />
                    </button>
                    <button type="button" className="workspace-sidebar-icon-button" title="Nuevo mensaje (próximamente)" aria-label="Nuevo mensaje" disabled>
                        <ComposeIcon />
                    </button>
                </div>
            </header>

            <div className="workspace-sidebar-search" aria-hidden="true">
                <SearchIcon />
                <span>Buscar una conversación...</span>
            </div>

            <nav className="workspace-sidebar-nav" aria-label="Secciones del espacio de trabajo">
                {
                    SIDEBAR_ITEMS.map(
                        item => (
                            <div key={item.label} className="workspace-sidebar-nav-item">
                                <span className="workspace-sidebar-nav-icon">
                                    {item.icon}
                                </span>
                                {item.label}
                            </div>
                        )
                    )
                }
            </nav>

            <div className="workspace-sidebar-divider" />

            <ChannelList />

            <footer className="workspace-sidebar-footer">
                <p>
                    Canales del espacio de trabajo
                </p>
            </footer>

        </aside>
    )
}
