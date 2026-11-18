import { Link } from "react-router";
import useWorkspaceList from "../hooks/useWorkspaceList";
import "./WorkspaceList.css";

/*
Colores para los recuadros de miembros (se eligen de forma deterministica
a partir del nombre, así cada miembro siempre tiene el mismo color).
*/
const AVATAR_COLORS = [
    "#f5498d", // rosa
    "#e8912d", // naranja
    "#2eb67d", // verde
    "#36c5f0", // celeste
    "#7c3aed", // violeta
    "#e01e5a", // fucsia
    "#1264a3", // azul
    "#ecb22e", // amarillo
];

function getInitial(nombre) {
    return nombre?.trim()?.charAt(0).toUpperCase() || "?";
}

function getAvatarColor(nombre) {
    let hash = 0;
    const texto = nombre || "";
    for (let i = 0; i < texto.length; i++) {
        hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// Recuadro con la inicial del nombre (los miembros no tienen imagen)
function MemberAvatar({ nombre }) {
    return (
        <span
            className="member-avatar"
            style={{ backgroundColor: getAvatarColor(nombre) }}
            title={nombre}
        >
            {getInitial(nombre)}
        </span>
    )
}

export default function WorkspaceList() {

    const {
        workspaces_error,
        workspaces_loading,
        workspaces_response,
        reloadWorkspaces
    } = useWorkspaceList()


    if (workspaces_loading) {
        return (
            <div className="workspace-card">
                <div className="workspace-card-body">
                    <span className="workspace-list-loading">Cargando...</span>
                </div>
            </div>
        )
    }
    else if (workspaces_error || !workspaces_response) {
        return (
            <div className="workspace-card">
                <div className="workspace-card-body">
                    <div className="workspace-list-error">
                        <span className="error-text">
                            Error: {workspaces_error || "Ocurrio un problema al obtener la lista de espacios de trabajo"}
                        </span>
                        <button onClick={reloadWorkspaces} className="workspace-retry-button">
                            Recargar
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    else if (workspaces_response.data.workspaces.length === 0) {
        return (
            <div className="workspace-card">
                <header className="workspace-card-header">
                    <span className="workspace-card-tab">Espacios de trabajo</span>
                </header>
                <div className="workspace-card-body">
                    <p className="workspace-empty-text">Aún no creaste ningún espacio de trabajo</p>
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="workspace-card">
                <header className="workspace-card-header">
                    <span className="workspace-card-tab">Espacios de trabajo</span>
                </header>

                <div className="workspace-card-body">
                    <h3 className="workspace-section-title">Listo para comenzar</h3>

                    <ul className="workspace-items">
                        {workspaces_response.data.workspaces.map((workspace) => {
                            const members = workspace.members || []
                            return (
                                <li key={workspace.workspace_id}>
                                    <Link
                                        to={`/workspace/${workspace.workspace_id}`}
                                        className="workspace-item"
                                    >
                                        <img
                                            src="https://a.slack-edge.com/80588/img/avatars-teams/ava_0018-88.png"
                                            alt=""
                                            width="52"
                                            height="52"
                                            className="workspace-icon workspace-icon-img"
                                        />

                                        <div className="workspace-item-info">
                                            <span className="workspace-item-name">
                                                {workspace.workspace_nombre}
                                            </span>
                                            <span className="workspace-item-meta">
                                                <span className="workspace-item-avatars">
                                                    {members.slice(0, 4).map((member) => (
                                                        <MemberAvatar
                                                            key={member.member_id}
                                                            nombre={member.nombre}
                                                        />
                                                    ))}
                                                </span>
                                                <span className="workspace-item-count">
                                                    {members.length} {members.length === 1 ? "miembro" : "miembros"}
                                                </span>
                                            </span>
                                        </div>

                                        <span className="workspace-item-enter" aria-hidden="true">
                                            <span className="workspace-item-enter-label">Iniciar</span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>

                <footer className="workspace-card-footer">
                    <a href="#" className="workspace-footer-link">Crea un nuevo espacio de trabajo</a>
                    <p className="workspace-footer-help">
                        ¿No puedes ver tu espacio de trabajo?{" "}
                        <a href="#" className="workspace-footer-link">Prueba con otro correo electrónico</a>
                    </p>
                </footer>
            </div>
        )
    }
}
