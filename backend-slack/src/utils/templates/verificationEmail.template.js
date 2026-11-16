import ENVIRONMENT from '../../config/environment.config.js'

/*
Plantilla HTML del mail de verificacion de correo.
El diseño imita la pantalla de registro (RegisterScreen) de la app:
fondo blanco, logo de Slack centrado, titulo y texto centrados.

Usamos tablas y estilos inline porque la mayoria de clientes de correo
(Gmail, Outlook, etc.) NO soportan CSS externo, flexbox ni gradientes.
Tampoco renderizan imagenes SVG, por eso usamos el PNG del logo de Slack.

Uso:
    import { verification_email_template } from '../utils/templates/verificationEmail.template.js'
    html: verification_email_template(verify_email_token)
*/

const COLOR_PRIMARY = '#491a54'        // --color-primary de la app
const COLOR_PRIMARY_LIGHT = '#f4ecf7'  // --color-primary-light de la app
const COLOR_TEXT = '#1d1c1d'           // --color-text de la app
const COLOR_TEXT_MUTED = '#616061'     // --color-text-muted de la app

export function verification_email_template(verify_email_token){

    const verify_url = `${ENVIRONMENT.URL_FRONTEND}/verify-email?verification_token=${verify_email_token}`

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, Helvetica, sans-serif;">

            <!-- Texto preheader: se ve en la vista previa de la bandeja de entrada -->
            <div style="display:none; max-height:0; overflow:hidden;">
                Confirma tu correo para activar tu cuenta y empezar a usar la app
            </div>

            <!-- Contenedor de fondo blanco (como la pantalla de registro) -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding:32px 16px 48px;">
                <tr>
                    <td align="center">

                        <!-- Tarjeta: todo el contenido centrado -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:483px; background-color:#ffffff;">
                            <tr>
                                <td style="padding:40px; text-align:center; font-family:Arial, Helvetica, sans-serif;">

                                    <!-- Logo de Slack centrado (PNG: los clientes de correo no renderizan SVG) -->
                                    <img
                                        src='https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png'
                                        alt='Slack'
                                        width='64'
                                        height='64'
                                        style='display:block; margin:0 auto 20px; border:none;'
                                    />

                                    <!-- Titulo grande centrado (mismo estilo que el register) -->
                                    <h1 style="margin:0; font-size:32px; font-weight:bold; color:${COLOR_TEXT}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        Verificación de email
                                    </h1>

                                    <!-- Subtitulo centrado (mismo estilo que el subtitle del register) -->
                                    <p style="margin:10px 0 0; font-size:16px; line-height:1.5; color:${COLOR_TEXT_MUTED}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        Necesitamos verificar que este correo electronico te pertenece
                                    </p>

                                    <!-- Boton principal -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                                        <tr>
                                            <td align="center" bgcolor="${COLOR_PRIMARY}" style="border-radius:8px;">
                                                <a href='${verify_url}'
                                                   style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px; font-family:Arial, Helvetica, sans-serif;">
                                                    Verificar mi cuenta
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Link de fallback por si el boton no funciona -->
                                    <p style="margin:28px 0 8px; font-size:14px; line-height:1.6; color:${COLOR_TEXT_MUTED}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        Si el boton no funciona, copia y pega este enlace en tu navegador:
                                    </p>
                                    <p style="margin:0 0 24px; font-size:14px; line-height:1.6; word-break:break-all; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        <a href='${verify_url}' style="color:${COLOR_PRIMARY}; font-weight:bold; text-decoration:none;">
                                            ${verify_url}
                                        </a>
                                    </p>

                                    <p style="margin:0; font-size:14px; line-height:1.6; color:${COLOR_TEXT_MUTED}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        El enlace expira en <strong>7 dias</strong>. Si no creaste esta cuenta,
                                        podes ignorar este mensaje y no se realizara ningun cambio.
                                    </p>

                                    <!-- Footer (mismo estilo que el footer del register) -->
                                    <p style="margin:28px 0 0; font-size:14px; color:${COLOR_TEXT_MUTED}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        Este es un mensaje automatico, por favor no respondas a este correo.
                                    </p>

                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>
        </body>
        </html>
    `
}
