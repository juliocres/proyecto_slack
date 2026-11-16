import './form.css'

function FormMessage({ type = 'error', children }) {
  if (!children) return null

  return (
    <div className={`form-message form-message--${type}`} role='alert'>
      {children}
    </div>
  )
}

export default FormMessage
