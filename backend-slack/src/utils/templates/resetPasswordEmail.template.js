import ENVIRONMENT from '../../config/environment.config.js'

/*
Plantilla HTML del mail de restablecimiento de contraseña.
El diseño imita la plantilla de verificacion de email (mismos colores,
logo de Slack centrado, todo el contenido centrado).

Usamos tablas y estilos inline porque la mayoria de clientes de correo
(Gmail, Outlook, etc.) NO soportan CSS externo, flexbox ni gradientes.

Uso:
    import { reset_password_email_template } from '../utils/templates/resetPasswordEmail.template.js'
    html: reset_password_email_template(reset_password_token)
*/

const COLOR_PRIMARY = '#491a54'        // --color-primary de la app
const COLOR_TEXT = '#1d1c1d'           // --color-text de la app
const COLOR_TEXT_MUTED = '#616061'     // --color-text-muted de la app

export function reset_password_email_template(reset_password_token){

    const reset_url = `${ENVIRONMENT.URL_FRONTEND}/reset-password?reset_token=${reset_password_token}`

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
                Restablece tu contraseña para volver a entrar a tu cuenta
            </div>

            <!-- Contenedor de fondo blanco (como la pantalla de login) -->
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

                                    <!-- Titulo grande centrado -->
                                    <h1 style="margin:0; font-size:32px; font-weight:bold; color:${COLOR_TEXT}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        Restablecer contraseña
                                    </h1>

                                    <!-- Subtitulo centrado -->
                                    <p style="margin:10px 0 0; font-size:16px; line-height:1.5; color:${COLOR_TEXT_MUTED}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        Recibimos una solicitud para restablecer la contraseña de tu cuenta
                                    </p>

                                    <!-- Boton principal -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                                        <tr>
                                            <td align="center" bgcolor="${COLOR_PRIMARY}" style="border-radius:8px;">
                                                <a href='${reset_url}'
                                                   style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px; font-family:Arial, Helvetica, sans-serif;">
                                                    Restablecer mi contraseña
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Link de fallback por si el boton no funciona -->
                                    <p style="margin:28px 0 8px; font-size:14px; line-height:1.6; color:${COLOR_TEXT_MUTED}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        Si el boton no funciona, copia y pega este enlace en tu navegador:
                                    </p>
                                    <p style="margin:0 0 24px; font-size:14px; line-height:1.6; word-break:break-all; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        <a href='${reset_url}' style="color:${COLOR_PRIMARY}; font-weight:bold; text-decoration:none;">
                                            ${reset_url}
                                        </a>
                                    </p>

                                    <p style="margin:0; font-size:14px; line-height:1.6; color:${COLOR_TEXT_MUTED}; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                        El enlace expira en <strong>15 minutos</strong>. Si no pediste restablecer tu contraseña,
                                        podes ignorar este mensaje y no se realizara ningun cambio.
                                    </p>

                                    <!-- Footer -->
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
