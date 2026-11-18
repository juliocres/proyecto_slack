import { useState } from "react";
import WorkspaceList from "../../Components/WorkspaceList.jsx";
import SlackNavbar from "../../Components/SlackNavbar.jsx";
import "./HomeScreen.css";

/* Icono de grilla para el encabezado de sección */
function GridIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
            <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
            <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
        </svg>
    );
}

/* Icono X para cerrar la promoción */
function CloseIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
    );
}

/* Tarjetas de la sección "Descubre más" */
const DISCOVER_ITEMS = [
    {
        icon: "💻",
        title: "Descarga Slack para Windows",
        text: "Lleva Slack contigo a donde vayas.",
    },
    {
        icon: "🔌",
        title: "Conecta tus herramientas",
        text: "Integra las apps que ya usas todos los días.",
    },
    {
        icon: "✅",
        title: "Crea tu lista de tareas de Slack",
        text: "Organiza tu trabajo sin salir de la conversación.",
    },
];

function HomeScreeen() {
    const [showDiscountPromo, setShowDiscountPromo] = useState(true);

    return (
        <div className="home-screen">
            {/* Barra de navegación estilo Slack */}
            <SlackNavbar />

            {/* Hero morado con saludo y curva inferior */}
            <section className="home-hero">
                <h1 className="home-hero-title">
                    ¡Hola otra vez!{" "}
                    <span className="home-hero-wave" role="img" aria-label="saludo">
                        👋
                    </span>
                </h1>
                <p className="home-hero-subtitle">
                    Elige un espacio de trabajo para empezar.
                </p>
            </section>

            {/* Contenido principal: espacios de trabajo + promos */}
            <main className="home-content">
                <section className="home-workspaces" aria-label="Mis espacios de trabajo">
                    <h2 className="home-section-label">
                        <GridIcon />
                        Mis espacios de trabajo
                    </h2>
                    <WorkspaceList />
                </section>

                <aside className="home-aside">
                    {showDiscountPromo && (
                        <div className="promo-card promo-card-discount">
                            <button
                                type="button"
                                className="promo-close"
                                aria-label="Cerrar promoción"
                                onClick={() => setShowDiscountPromo(false)}
                            >
                                <CloseIcon />
                            </button>
                            <h3>Consigue un 50 % de descuento en el plan Pro.</h3>
                            <p>Solo tienes 6 días para disfrutar de esta oferta.</p>
                            <button type="button" className="promo-button promo-button-primary">
                                <span aria-hidden="true">🚀</span> Ascender de plan
                            </button>
                        </div>
                    )}

                    <div className="promo-card promo-card-templates">
                        <div className="promo-templates-info">
                            <h3>Comienza con una plantilla.</h3>
                            <p>Inicia proyectos con un solo clic.</p>
                            <button type="button" className="promo-button promo-button-outline">
                                Explorar plantillas
                            </button>
                        </div>
                        <div className="promo-illustration" aria-hidden="true">
                            📚
                        </div>
                    </div>
                </aside>
            </main>

            {/* Sección "Descubre más" */}
            <section className="home-discover">
                <h2 className="home-section-label">
                    <span aria-hidden="true">✨</span>
                    Descubre más
                </h2>
                <div className="discover-grid">
                    {DISCOVER_ITEMS.map((item) => (
                        <article key={item.title} className="discover-card">
                            <span className="discover-card-icon" aria-hidden="true">
                                {item.icon}
                            </span>
                            <div>
                                <h3 className="discover-card-title">{item.title}</h3>
                                <p className="discover-card-text">{item.text}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default HomeScreeen
