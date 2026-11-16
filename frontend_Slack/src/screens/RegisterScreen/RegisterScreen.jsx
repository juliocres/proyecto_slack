import React from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import { register } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import FormField from '../../components/Form/FormField'
import FormMessage from '../../components/Form/FormMessage'
import SubmitButton from '../../components/Form/SubmitButton'
import './RegisterScreen.css'

function RegisterScreen() {
  const initial_state = {name: '', email: '', password: ''} 
  const {formState, handleChangeInput} = useForm(initial_state)
  const {loading, response, error, sendRequest} = useRequest()

  async function handleSubmit (event){
    event.preventDefault()
    sendRequest(
        () => register(formState.name, formState.email, formState.password)
    )
    console.log('Usuario intenta registrarse', formState)
  }


  return (
    <main className='register-page'>
      <div className='register-card'>
        <img
          className='register-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='register-title'>Registro de usuario</h1>
        <p className='register-subtitle'>Crea tu cuenta para empezar a usar la app</p>
          <form className='register-form' onSubmit={handleSubmit}>
            <FormField
              label='Nombre:'
              name='name'
              id='name'
              type='text'
              value={formState.name}
              onChange={handleChangeInput}
            />
            <FormField
              label='Email:'
              name='email'
              id='email'
              type='email'
              value={formState.email}
              onChange={handleChangeInput}
            />
            <FormField
              label='Password:'
              name='password'
              id='password'
              type='password'
              value={formState.password}
              onChange={handleChangeInput}
            />
            {
              error
              &&
              !loading
              &&
              <FormMessage type='error'>{error}</FormMessage>
            }

            {
              response
              &&
              !loading
              &&
              <FormMessage type='success'>Registro exitoso</FormMessage>
            }

            <SubmitButton loading={loading}>Registrarse</SubmitButton>
          </form>
          <p className='register-footer'>
            ¿Ya tienes una cuenta? <Link to='/login'>Inicia sesión</Link>
          </p>
      </div>
    </main>
  )
}

export default RegisterScreen
