import React from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import { resendVerificationEmail } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import FormField from '../../components/Form/FormField'
import FormMessage from '../../components/Form/FormMessage'
import SubmitButton from '../../components/Form/SubmitButton'
import './ResendEmailScreen.css'

function ResendEmailScreen() {
  const initial_state = {email: ''}
  const {formState, handleChangeInput} = useForm(initial_state)
  const {loading, response, error, sendRequest} = useRequest()

  async function handleSubmit (event){
    event.preventDefault()
    sendRequest(
      () => resendVerificationEmail(formState.email)
    )
  }

  return (
    <main className='resend-email-page'>
      <div className='resend-email-card'>
        <img
          className='resend-email-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='resend-email-title'>Reenviar verificación</h1>
        <p className='resend-email-subtitle'>
          Ingresa tu email y te enviaremos un nuevo enlace de verificación
        </p>
        <form className='resend-email-form' onSubmit={handleSubmit}>
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
        <p className='resend-email-footer'>
          ¿Ya verificaste tu cuenta? <Link to='/login'>Inicia sesión</Link>
        </p>
      </div>
    </main>
  )
}

export default ResendEmailScreen
