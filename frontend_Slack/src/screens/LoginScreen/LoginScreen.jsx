import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import FormField from '../../components/Form/FormField'
import FormMessage from '../../components/Form/FormMessage'
import SubmitButton from '../../components/Form/SubmitButton'
import './LoginScreen.css'

function LoginScreen() {
  const initial_state = {email: '', password: ''}
  const {formState, handleChangeInput} = useForm(initial_state)
  const {loading, response, error, sendRequest} = useRequest()

  const navigate = useNavigate()

  async function handleSubmit (event){
    event.preventDefault()
    sendRequest(
      () => login(formState.email, formState.password)
    )
    console.log('Usuario intenta iniciar sesion', formState)
  }

  /*
  Los efectos sirven para controlar la recarga/ejecucion de una funcion

  Cuando la response cambie/llegue:
      - Guardar en localstorage el auth_token (para que luego podamos seguir usandolo)
      - voy a redireccionar a /home
  */
  useEffect(
    () => {
      if(response && response.data){
        localStorage.setItem('auth_token', response.data.auth_token)
        navigate('/')
      }
    },
    [response]
  )

  return (
    <main className='login-page'>
      <div className='login-card'>
        <img
          className='login-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='login-title'>Iniciar sesión</h1>
        <p className='login-subtitle'>Ingresa a tu cuenta para seguir usando la app</p>
        <form className='login-form' onSubmit={handleSubmit}>
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
            <FormMessage type='success'>Inicio de sesión exitoso</FormMessage>
          }

          <SubmitButton loading={loading}>Iniciar sesión</SubmitButton>
        </form>
        <p className='login-footer'>
          ¿No tienes una cuenta? <Link to='/register'>Regístrate</Link>
        </p>
        <p className='login-footer'>
          ¿No recibiste el mail de verificación? <Link to='/resend_email_verification'>Reenviar</Link>
        </p>
        <p className='login-footer'>
          ¿Olvidaste tu contraseña? <Link to='/forgot-password'>Olvidé mi contraseña</Link>
        </p>
      </div>
    </main>
  )
}

export default LoginScreen
