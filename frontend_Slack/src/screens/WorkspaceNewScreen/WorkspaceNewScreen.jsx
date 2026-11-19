import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { createWorkspace } from '../../services/workspaceService'
import FormField from '../../Components/Form/FormField'
import FormMessage from '../../Components/Form/FormMessage'
import SubmitButton from '../../Components/Form/SubmitButton'
import './WorkspaceNewScreen.css'

const NAME_MAX_LENGTH = 50
const DESCRIPTION_MAX_LENGTH = 1000

function WorkspaceNewScreen() {
  const initial_state = { name: '', description: '' }
  const { formState, handleChangeInput } = useForm(initial_state)
  const { loading, response, error, sendRequest } = useRequest()

  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    sendRequest(
      () => createWorkspace(formState.name, formState.description)
    )
  }

  /*
  Cuando la response llegue (espacio de trabajo creado):
  volvemos al inicio, donde la lista de espacios de trabajo
  se vuelve a pedir al servidor y muestra el nuevo espacio.
  */
  useEffect(
    () => {
      if (response) {
        navigate('/', { replace: true })
      }
    },
    [response]
  )

  return (
    <main className='workspace-new-page'>
      <div className='workspace-new-card'>
        <img
          className='workspace-new-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='workspace-new-title'>Asigna un nombre a tu espacio de trabajo de Slack</h1>
        <p className='workspace-new-subtitle'>
          Elige algo que tu equipo reconozca fácilmente, como el nombre de la empresa o del equipo. Puedes modificarlo cuando quieras.
        </p>
        <form className='workspace-new-form' onSubmit={handleSubmit}>
          <FormField
            label='Nombre del espacio de trabajo:'
            name='name'
            id='name'
            type='text'
            placeholder='P. ej.: Ficciones S. A.'
            value={formState.name}
            onChange={handleChangeInput}
            maxLength={NAME_MAX_LENGTH}
            required
          />
          <FormField
            label='Descripción (opcional):'
            name='description'
            id='description'
            multiline
            rows={5}
            placeholder='Cuéntale a tu equipo de qué trata este espacio de trabajo'
            value={formState.description}
            onChange={handleChangeInput}
            maxLength={DESCRIPTION_MAX_LENGTH}
          />
          {
            error
            &&
            !loading
            &&
            <FormMessage type='error'>{error}</FormMessage>
          }

          <SubmitButton loading={loading}>Continuar</SubmitButton>
        </form>
        <p className='workspace-new-footer'>
          ¿Cambiaste de opinión? <Link to='/'>Volver al inicio</Link>
        </p>
      </div>
    </main>
  )
}

export default WorkspaceNewScreen
