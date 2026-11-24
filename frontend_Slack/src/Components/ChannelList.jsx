import { useChannel } from "../context/ChannelContext"
import "./ChannelList.css"

function ChevronDownIcon() {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    )
}

function PlusIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}

/*
Lista de canales del workspace.

Consume ChannelContext:
    - channels: lista que devuelve GET /api/workspaces/:workspace_id/channels
    - selected_channel_id / selectChannel: canal activo
    - channels_loading / channels_error / reloadChannels: estados de la API
*/
export default function ChannelList() {

    const {
        channels,
        selected_channel_id,
        selectChannel,
        channels_loading,
        channels_error,
        reloadChannels
    } = useChannel()

    return (
        <section className="channel-list" aria-label="Canales del espacio de trabajo">

            <header className="channel-list-header">
                <span className="channel-list-title">
                    <ChevronDownIcon />
                    Canales
                </span>

                <span className="channel-list-count">
                    {channels.length}
                </span>

                <button
                    type="button"
                    className="channel-list-add"
                    title="Crear canal (próximamente)"
                    aria-label="Crear canal"
                    disabled
                >
                    <PlusIcon />
                </button>
            </header>

            {
                channels_loading
                &&
                <div className="channel-list-loading" aria-live="polite">
                    <span className="channel-list-loading-text">Cargando canales...</span>
                    <span className="channel-list-skeleton" />
                    <span className="channel-list-skeleton channel-list-skeleton--short" />
                    <span className="channel-list-skeleton" />
                </div>
            }

            {
                !channels_loading
                &&
                channels_error
                &&
                <div className="channel-list-state">
                    <p className="channel-list-state-text">
                        No se pudieron cargar los canales.
                    </p>
                    <p className="channel-list-state-detail">
                        {channels_error}
                    </p>
                    <button
                        type="button"
                        className="channel-list-retry"
                        onClick={reloadChannels}
                    >
                        Reintentar
                    </button>
                </div>
            }

            {
                !channels_loading
                &&
                !channels_error
                &&
                channels.length === 0
                &&
                <div className="channel-list-state">
                    <span className="channel-list-state-icon" aria-hidden="true">
                        #
                    </span>
                    <p className="channel-list-state-text">
                        Todavía no hay canales en este espacio de trabajo.
                    </p>
                </div>
            }

            {
                !channels_loading
                &&
                !channels_error
                &&
                channels.length > 0
                &&
                <ul className="channel-list-items">
                    {
                        channels.map(
                            channel => {
                                const is_selected = channel._id === selected_channel_id

                                return (
                                    <li key={channel._id}>
                                        <button
                                            type="button"
                                            className={
                                                `channel-list-item${is_selected ? ' channel-list-item--active' : ''}`
                                            }
                                            onClick={() => selectChannel(channel._id)}
                                            aria-current={is_selected ? 'page' : undefined}
                                            aria-label={`Canal ${channel.nombre}`}
                                            title={channel.descripcion || channel.nombre}
                                        >
                                            <span className="channel-list-hash" aria-hidden="true">
                                                #
                                            </span>
                                            <span className="channel-list-name">
                                                {channel.nombre}
                                            </span>
                                        </button>
                                    </li>
                                )
                            }
                        )
                    }
                </ul>
            }

        </section>
    )
}
