import React from 'react'
import { Route, Routes } from 'react-router'
import HomeScreeen from './screens/HomeScreen/HomeScreeen'
import WorkspaceNewScreen from './screens/WorkspaceNewScreen/WorkspaceNewScreen'
import WorkspaceScreen from './screens/WorkspaceScreen/WorkspaceScreen'
import LoginScreen from './screens/LoginScreen/LoginScreen'
import RegisterScreen from './screens/RegisterScreen/RegisterScreen'
import VerifyEmailScreen from './screens/VerifyEmailScreen/VerifyEmailScreen'
import ResendEmailScreen from './screens/ResendEmailScreen/ResendEmailScreen'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen/ForgotPasswordScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen/ResetPasswordScreen'
import AuthMiddleware from './Middlewares/AuthMiddleware'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { ChannelProvider } from './context/ChannelContext'

const App = () => {
  return (
    <Routes>
      <Route element={<AuthMiddleware/>}>

        <Route path='/' element={<HomeScreeen/>}/>

        <Route path='/home' element={<HomeScreeen/>}/>

        <Route path='/workspaces/new' element={<WorkspaceNewScreen/>}/>

        <Route
          path='/workspace/:workspace_id'
          element={
            <WorkspaceProvider>
              <ChannelProvider>
                <WorkspaceScreen/>
              </ChannelProvider>
            </WorkspaceProvider>
          }
        />

      </Route>
        <Route path='/login' element={<LoginScreen/>}/>

        <Route path='/register' element={<RegisterScreen/>} />

        <Route path='/verify-email' element={<VerifyEmailScreen/>} />

        <Route path='/resend_email_verification' element={<ResendEmailScreen/>} />

        <Route path='/forgot-password' element={<ForgotPasswordScreen/>} />

        <Route path='/reset-password' element={<ResetPasswordScreen/>} />
    </Routes>
  )
}


export default App