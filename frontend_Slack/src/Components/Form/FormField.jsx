import './form.css'

function FormField({ label, name, id, type = 'text', value, onChange }) {
  return (
    <div className='form-field'>
      <label className='form-label' htmlFor={id}>
        {label}
      </label>
      <input
        className='form-input'
        name={name}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default FormField
