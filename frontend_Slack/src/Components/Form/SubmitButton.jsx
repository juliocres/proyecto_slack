import './form.css'

function SubmitButton({ loading = false, children }) {
  return (
    <button
      type='submit'
      className={`submit-button${loading ? ' submit-button--loading' : ''}`}
      disabled={loading}
    >
      {/*
      Mantenemos siempre la misma estructura de nodos: el spinner se oculta
      con CSS y el texto se actualiza sin desmontar hijos. Asi el traductor
      del navegador no rompe el DOM de React al cambiar a "Cargando...".
      */}
      <span
        className={`spinner${loading ? '' : ' spinner--hidden'}`}
        aria-hidden='true'
      ></span>
      <span className='submit-button-label'>
        {loading ? 'Cargando...' : children}
      </span>
    </button>
  )
}

export default SubmitButton
