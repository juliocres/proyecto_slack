import './form.css'

function SubmitButton({ loading = false, children }) {
  return (
    <button
      type='submit'
      className={`submit-button${loading ? ' submit-button--loading' : ''}`}
      disabled={loading}
    >
      {loading ? (
        <>
          <span className='spinner' aria-hidden='true'></span>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default SubmitButton
