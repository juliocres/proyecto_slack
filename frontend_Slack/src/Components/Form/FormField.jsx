import './form.css'

function FormField({
  label,
  name,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
  rows = 4,
  required = false,
}) {
  const currentLength = String(value ?? '').length
  const hasCounter = Boolean(maxLength)
  const inputProps = {
    name,
    id,
    value,
    onChange,
    placeholder,
    maxLength,
    required,
  }

  return (
    <div className='form-field'>
      <label className='form-label' htmlFor={id}>
        {label}
      </label>

      <div className={`form-input-wrapper${multiline ? ' form-input-wrapper--textarea' : ''}`}>
        {multiline ? (
          <textarea
            {...inputProps}
            className={`form-input form-textarea${hasCounter ? ' form-textarea--with-counter' : ''}`}
            rows={rows}
          />
        ) : (
          <input
            {...inputProps}
            className={`form-input${hasCounter ? ' form-input--with-counter' : ''}`}
            type={type}
          />
        )}

        {hasCounter && (
          <span
            className={`form-field-counter${currentLength >= maxLength ? ' form-field-counter--limit' : ''}`}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

export default FormField
