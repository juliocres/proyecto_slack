import { useEffect, useRef, useState } from "react"
import { useChannel } from "../context/ChannelContext"
import "./ChannelFormModal.css"

const NAME_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 1000

function CloseIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
    )
}

/*
Modal para crear o editar un canal (estilo Slack).

Si recibe `channel`, entra en modo edicion y precarga nombre y descripcion.
El POST/PUT lo hace el ChannelContext, que ademas actualiza la lista local.
*/
export default function ChannelFormModal({ channel = null, onClose }) {

    const is_edit = Boolean(channel)

    const {
        createChannel,
        updateChannel,
        channel_creating,
        channel_create_error,
        clearCreateError,
        channel_updating,
        channel_update_error,
        clearUpdateError
    } = useChannel()

    const [name, setName] = useState(channel?.nombre ?? "")
    const [description, setDescription] = useState(channel?.descripcion ?? "")

    const submitting = is_edit ? channel_updating : channel_creating
    const submit_error = is_edit ? channel_update_error : channel_create_error
    const clearSubmitError = is_edit ? clearUpdateError : clearCreateError

    const name_input_ref = useRef(null)

    useEffect(
        () => {
            clearSubmitError()
            name_input_ref.current?.focus()
        },
        []
    )

    //Cerrar con Escape (salvo mientras se esta guardando)
    useEffect(
        () => {
            function handleKeyDown(event) {
                if (event.key === "Escape" && !submitting) {
                    onClose()
                }
            }

            document.addEventListener("keydown", handleKeyDown)

            return () => document.removeEventListener("keydown", handleKeyDown)
        },
        [onClose, submitting]
    )

    async function handleSubmit(event) {
        event.preventDefault()

        const result = is_edit
            ? await updateChannel(channel._id, name, description)
            : await createChannel(name, description)

        if (result) {
            onClose()
        }
    }

    const normalized_name = name
        .trim()
        .replace(/^#+/, "")
        .replace(/\s+/g, "-")
        .toLowerCase()

    const can_submit = normalized_name.length > 0 && !submitting

    return (
        <div
            className="channel-form-overlay"
            onMouseDown={
                event => {
                    if (event.target === event.currentTarget && !submitting) {
                        onClose()
                    }
                }
            }
        >
            <div
                className="channel-form-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="channel-form-title"
            >

                <header className="channel-form-header">
                    <h2 id="channel-form-title" className="channel-form-title">
                        {
                            is_edit
                                ? "Editar canal"
                                : "Crear un canal"
                        }
                    </h2>

                    <button
                        type="button"
                        className="channel-form-close"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Cerrar"
                    >
                        <CloseIcon />
                    </button>
                </header>

                <p className="channel-form-subtitle">
                    {
                        is_edit
                            ? `Cambiá el nombre o la descripción de #${channel.nombre}.`
                            : "Los canales son para todo lo que se conversa en un espacio de trabajo."
                    }
                </p>

                <form className="channel-form" onSubmit={handleSubmit}>

                    <label className="channel-form-label" htmlFor="channel-form-name">
                        Nombre
                    </label>

                    <div className="channel-form-name-field">
                        <span className="channel-form-hash" aria-hidden="true">#</span>
                        <input
                            ref={name_input_ref}
                            id="channel-form-name"
                            name="name"
                            className="channel-form-input"
                            type="text"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="p. ej. plan-marketing"
                            maxLength={NAME_MAX_LENGTH}
                            autoComplete="off"
                            required
                        />
                    </div>

                    <p className="channel-form-hint">
                        {
                            normalized_name
                                ? <>Se va a {is_edit ? "guardar" : "crear"} como <strong>#{normalized_name}</strong>. </>
                                : null
                        }
                        Los nombres van en minúsculas, sin espacios ni puntos.
                    </p>

                    <label className="channel-form-label" htmlFor="channel-form-description">
                        Descripción <span className="channel-form-optional">(opcional)</span>
                    </label>

                    <textarea
                        id="channel-form-description"
                        name="description"
                        className="channel-form-textarea"
                        value={description}
                        onChange={event => setDescription(event.target.value)}
                        placeholder="¿De qué trata este canal?"
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        rows={3}
                    />

                    <span className="channel-form-counter">
                        {description.length}/{DESCRIPTION_MAX_LENGTH}
                    </span>

                    {
                        submit_error
                        &&
                        <div className="channel-form-error" role="alert">
                            {submit_error}
                        </div>
                    }

                    <footer className="channel-form-actions">
                        <button
                            type="button"
                            className="channel-form-button channel-form-button--cancel"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="channel-form-button channel-form-button--submit"
                            disabled={!can_submit}
                        >
                            {
                                submitting
                                    ? (is_edit ? "Guardando..." : "Creando...")
                                    : (is_edit ? "Guardar" : "Crear")
                            }
                        </button>
                    </footer>

                </form>

            </div>
        </div>
    )
}
