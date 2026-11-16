import React from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import { forgotPassword } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import FormField from '../../Components/Form/FormField'
import FormMessage from '../../Components/Form/FormMessage'
import SubmitButton from '../../Components/Form/SubmitButton'
import './ForgotPasswordScreen.css'

function ForgotPasswordScreen() {
  const initial_state = {email: ''}
  const {formState, handleChangeInput} = useForm(initial_state)
  const {loading, response, error, sendRequest} = useRequest()

  async function handleSubmit (event){
    event.preventDefault()
    sendRequest(
      () => forgotPassword(formState.email)
    )
  }

  return (
    <main className='forgot-password-page'>
      <div className='forgot-password-card'>
        <img
          className='forgot-password-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='forgot-password-title'>Olvidé mi contraseña</h1>
        <p className='forgot-password-subtitle'>
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </p>
        <form className='forgot-password-form' onSubmit={handleSubmit}>
          <FormField
            label='Email:'
            name='email'
            id='email'
            type='email'
            value={formState.email}
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
            <FormMessage type='success'>{response.message}</FormMessage>
          }

          <SubmitButton loading={loading}>Enviar</SubmitButton>
        </form>
        <p className='forgot-password-footer'>
          ¿Ya tienes la contraseña? <Link to='/login'>Inicia sesión</Link>
        </p>
      </div>
    </main>
  )
}

export default ForgotPasswordScreen
