import { Component } from 'react'
import './ErrorBoundary.css'

/*
React desmonta todo el arbol cuando un componente lanza un error durante
el render. Sin un error boundary eso deja la pantalla en blanco y sin pistas.
Este componente captura el error, lo muestra y lo registra en consola.
*/
class ErrorBoundary extends Component {

    constructor(props) {
        super(props)
        this.state = { error: null }
        this.handleReload = this.handleReload.bind(this)
    }

    static getDerivedStateFromError(error) {
        return { error }
    }

    componentDidCatch(error, error_info) {
        console.error('[ErrorBoundary]', error, error_info)
    }

    handleReload() {
        window.location.reload()
    }

    render() {
        if (this.state.error) {
            return (
                <main className='error-boundary-page'>
                    <div className='error-boundary-card'>
                        <h1 className='error-boundary-title'>Ocurrió un error inesperado</h1>
                        <p className='error-boundary-text'>
                            Revisá la consola del navegador para ver el detalle.
                        </p>
                        <pre className='error-boundary-detail'>
                            {this.state.error.message}
                        </pre>
                        <button
                            type='button'
                            className='error-boundary-button'
                            onClick={this.handleReload}
                        >
                            Recargar
                        </button>
                    </div>
                </main>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
