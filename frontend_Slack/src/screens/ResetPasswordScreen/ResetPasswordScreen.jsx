import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useForm from '../../hooks/useForm'
import { resetPassword } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import FormField from '../../Components/Form/FormField'
import FormMessage from '../../Components/Form/FormMessage'
import SubmitButton from '../../Components/Form/SubmitButton'
import './ResetPasswordScreen.css'

/*
El token que llega por querystring es un JWT cuyo payload (parte central,
en base64url) contiene el email del usuario. Lo decodificamos en el cliente
SOLO para leer el email y enviarlo al backend: la validacion de verdad
(firma + expiracion + coincidencia con el email) la hace el backend.
*/
function getEmailFromToken(token){
  try{
    const payload_base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(payload_base64))
    return payload.email
  }
  catch{
    return null
  }
}

function ResetPasswordScreen() {
  /* Leemos el reset_token que llega por querystring: /reset-password?reset_token=xxx */
  const [searchParams] = useSearchParams()
  const reset_token = searchParams.get('reset_token')
  const email = reset_token ? getEmailFromToken(reset_token) : null

  const initial_state = {password: '', confirm_password: ''}
  const {formState, handleChangeInput} = useForm(initial_state)
  const {loading, response, error, sendRequest} = useRequest()

  /* Guardamos el error de validacion del formulario (las passwords no coinciden) */
  const [form_error, setFormError] = useState(null)

  const navigate = useNavigate()

  async function handleSubmit (event){
    event.preventDefault()
    setFormError(null)

    /* Las dos contraseñas deben coincidir antes de enviar nada al backend */
    if(formState.password !== formState.confirm_password){
      setFormError('Las contraseñas no coinciden')
      return
    }

    sendRequest(
      () => resetPassword(reset_token, email, formState.password)
    )
  }

  /* Si el restablecimiento fue exitoso, redireccionamos a /login despues de unos segundos */
  useEffect(
    () => {
      if(response && response.ok){
        const redirect_timeout = setTimeout(
          () => {
            navigate('/login')
          },
          3000
        )
        return () => clearTimeout(redirect_timeout)
      }
    },
    [response]
  )

  return (
    <main className='reset-password-page'>
      <div className='reset-password-card'>
        <img
          className='reset-password-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='reset-password-title'>Restablecer contraseña</h1>
        <p className='reset-password-subtitle'>
          Ingresa tu nueva contraseña para volver a entrar a tu cuenta
        </p>

        {
          (!reset_token || !email)
          &&
          <FormMessage type='error'>
            No se encontro un token de restablecimiento valido en la URL
          </FormMessage>
        }

        {
          reset_token
          && email
          &&
          <form className='reset-password-form' onSubmit={handleSubmit}>
            <FormField
              label='Nueva contraseña:'
              name='password'
              id='password'
              type='password'
              value={formState.password}
              onChange={handleChangeInput}
            />
            <FormField
              label='Confirmar contraseña:'
              name='confirm_password'
              id='confirm_password'
              type='password'
              value={formState.confirm_password}
              onChange={handleChangeInput}
            />
            {
              (form_error || error)
              &&
              !loading
              &&
              <FormMessage type='error'>{form_error || error}</FormMessage>
            }

            {
              response
              &&
              response.ok
              &&
              !loading
              &&
              <>
                <FormMessage type='success'>Tu contraseña fue restablecida correctamente</FormMessage>
                <p className='reset-password-message'>
                  Te redireccionaremos a la página de inicio de sesión...
                </p>
              </>
            }

            <SubmitButton loading={loading}>Restablecer contraseña</SubmitButton>
          </form>
        }

        <p className='reset-password-footer'>
          <Link to='/login'>Ir a iniciar sesión</Link>
        </p>
      </div>
    </main>
  )
}

export default ResetPasswordScreen
