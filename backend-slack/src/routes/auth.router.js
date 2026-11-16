import express from 'express'
import { login, register, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js'

const auth_router = express.Router()

/* 
Validacion del email del usuario
*/
auth_router.post('/register', register)

/* 
Cuando un usuario inicia sesion debemos crear de alguna forma la sesion
*/
auth_router.post('/login', login)

auth_router.get('/verify-email',  verifyEmail)

/*
Reenvio del mail de verificacion con un token nuevo
Ej: GET /api/auth/verify-email/test@mail.com/resend
*/
auth_router.get('/verify-email/:email/resend', resendVerificationEmail)

/*
Solicitud de restablecimiento de contraseña:
Envia un mail con un token (si el usuario existe) para poder restablecerla
*/
auth_router.post('/forgot-password', forgotPassword)

/*
Restablecimiento de contraseña:
Recibe el token (del mail), el email y la nueva password
*/
auth_router.post('/reset-password', resetPassword)

export default auth_router