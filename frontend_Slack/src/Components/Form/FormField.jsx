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

      {multiline ? (
        <textarea
          {...inputProps}
          className='form-input form-textarea'
          rows={rows}
        />
      ) : (
        <input {...inputProps} className='form-input' type={type} />
      )}

      {maxLength && (
        <span
          className={`form-field-counter${currentLength >= maxLength ? ' form-field-counter--limit' : ''}`}
        >
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  )
}

export default FormField
