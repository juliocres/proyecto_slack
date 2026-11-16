import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { verifyEmail } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import FormMessage from '../../Components/Form/FormMessage'
import './VerifyEmailScreen.css'

function VerifyEmailScreen() {
  /* Leemos el verification_token que llega por querystring: /verify-email?verification_token=xxx */
  const [searchParams] = useSearchParams()
  const verification_token = searchParams.get('verification_token')

  const {loading, response, error, sendRequest} = useRequest()
  /* Guardamos aparte si ya lanzamos la verificacion, para no repetirla en cada render */
  const [verification_started, setVerificationStarted] = useState(false)

  const navigate = useNavigate()

  useEffect(
    () => {
      /* Solo verificamos una vez y solo si el token existe */
      if(verification_token && !verification_started){
        setVerificationStarted(true)
        sendRequest(() => verifyEmail(verification_token))
      }
    },
    [verification_token, verification_started]
  )

  /* Si la verificacion fue exitosa, redireccionamos a /login despues de unos segundos */
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
    <main className='verify-email-page'>
      <div className='verify-email-card'>
        <img
          className='verify-email-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='verify-email-title'>Verificación de email</h1>

        {
          !verification_token
          &&
          <FormMessage type='error'>
            No se encontro el token de verificación en la URL
          </FormMessage>
        }

        {
          verification_token
          &&
          loading
          &&
          <p className='verify-email-message'>Estamos verificando tu cuenta, espera un momento...</p>
        }

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
          response.ok
          &&
          !loading
          &&
          <>
            <FormMessage type='success'>Tu email fue verificado correctamente</FormMessage>
            <p className='verify-email-message'>
              Te redireccionaremos a la página de inicio de sesión...
            </p>
          </>
        }

        <p className='verify-email-footer'>
          <Link to='/login'>Ir a iniciar sesión</Link>
        </p>
      </div>
    </main>
  )
}

export default VerifyEmailScreen
