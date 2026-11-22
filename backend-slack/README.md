# Slack API - Documentacion del backend

Documentacion del alcance del proyecto y de los endpoints implementados en el
backend. La referencia interactiva (OpenAPI/Swagger) se sirve en:

- `GET /api/docs` → Swagger UI
- `GET /api/docs.json` → especificacion OpenAPI cruda

---

## 1. Alcance del proyecto

Este backend es una API REST para una plataforma de colaboracion tipo Slack.
Permite:

- Registrar usuarios, verificar el email y autenticarse con JWT.
- Restablecer la contrasena por email.
- Crear y administrar espacios de trabajo (workspaces).
- Gestionar miembros mediante invitaciones por email y roles.
- Consultar los canales de cada workspace y su historial de mensajes.
- Registrar cada consulta HTTP recibida, guardando el body de las operaciones
  de escritura cifrado con `LOGGER_PRIVATE_KEY`.

### Incluido en este alcance

| Area | Estado |
| --- | --- |
| Autenticacion (registro, login, verificacion de email, reset de password) | Implementado |
| Usuarios (listado, detalle y baja de la propia cuenta) | Implementado |
| Workspaces (listado, alta, detalle, edicion y baja) | Implementado |
| Miembros (invitacion, aceptacion y expulsion) | Implementado |
| Canales (listado y detalle) | Implementado |
| Mensajes de canal (solo lectura del historial) | Implementado |
| Registro de consultas con body cifrado | Implementado |
| Documentacion OpenAPI / Swagger UI | Implementado |

### Fuera del alcance actual

- Crear, editar o eliminar canales.
- Enviar, editar o eliminar mensajes (solo se consultan los existentes).
- Mensajes directos (existe `directMessage.model.js`, pero esta vacio).
- Paginacion en los listados: devuelven todos los documentos que coinciden.
- Refresh tokens o revocacion de sesiones: el JWT de sesion no tiene expiracion.
- Recuperacion de contrasena mediante enlace web del frontend (el backend envia
  el token por mail y expone el endpoint de reset).
- Roles globales de administrador: los roles (`owner`, `admin`, `user`) son
  siempre dentro de un workspace.

### Advertencia de seguridad conocida

`GET /api/users` y `GET /api/users/:user_id` devuelven el documento completo del
usuario, incluido el hash de la contrasena (`password`). Es el comportamiento
actual de la API y esta marcado como advertencia en Swagger. Antes de publicar
el proyecto en produccion conviene excluir ese campo de las respuestas.

---

## 2. Stack y arquitectura

- **Runtime:** Node.js (ES Modules).
- **Framework:** Express 5.
- **Base de datos:** MongoDB + Mongoose.
- **Autenticacion:** JWT (`jsonwebtoken`) y bcrypt para contrasenas.
- **Emails:** Nodemailer con Gmail.
- **Documentacion:** `swagger-jsdoc` + `swagger-ui-express`.
- **Despliegue:** compatible con Vercel (`@vercel/node`); en local usa
  `app.listen`.

Capas del backend:

```
src/
├── config/          Variables de entorno y conexiones (Mongo, MySQL, mailer)
├── controllers/     Capa HTTP: leen request y arman response
├── dto/             Objetos de transferencia
├── middlewares/     Auth, validacion de workspace, logger y manejo de errores
├── models/          Schemas de Mongoose
├── repositories/    Acceso a datos
├── routes/          Definicion de rutas + anotaciones OpenAPI
├── services/        Logica de negocio
├── utils/           Cifrado, bcrypt, errores y plantillas de email
├── docs/            Configuracion de Swagger
└── main.js          Punto de entrada de la aplicacion
```

Flujo de una request:

```
request → middlewares → controller → service → repository → MongoDB
                                   ↘ respuesta HTTP
```

`GET`, `POST`, `PUT`, `DELETE` no tienen logica en la ruta: el router solo
engancha middlewares y el controller correspondiente.

---

## 3. Configuracion y ejecucion

### Variables de entorno

Crear `backend-slack/.env` a partir de `.env.example`.

| Variable | Uso |
| --- | --- |
| `MONGO_DB_URI` | URI de conexion a MongoDB (local o Atlas) |
| `MONGO_DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET` | Secreto con el que se firman los JWT |
| `GMAIL_USER` | Cuenta de Gmail usada para enviar emails |
| `GMAIL_PASSWORD` | Contrasena de aplicacion de Gmail |
| `URL_BACKEND` | URL publica del backend |
| `URL_FRONTEND` | URL del frontend (usada en links de emails) |
| `PORT` | Puerto local (por defecto `8080` en el ejemplo) |
| `LOGGER_PRIVATE_KEY` | Clave con la que se cifran los bodies del logger |

Las variables `MYSQL_DB_*` siguen presentes en `environment.config.js` por la
configuracion heredada de MySQL, pero los endpoints actuales usan MongoDB.

### Comandos

```bash
cd backend-slack
npm install
npm run dev     # node --watch ./src/main.js
npm start       # node ./src/main.js
```

Con el servidor levantado:

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/api/docs`
- OpenAPI JSON: `http://localhost:8080/api/docs.json`

En Vercel no se ejecuta `app.listen`: se exporta `app` como handler.

---

## 4. Autenticacion y roles

### JWT de sesion

Los endpoints protegidos esperan el header:

```
Authorization: Bearer <auth_token>
```

El token se obtiene en `POST /api/auth/login`. Su payload contiene:

```json
{
  "id": "<ObjectId del usuario>",
  "name": "<nombre>",
  "email": "<email>"
}
```

El token de sesion se firma con `JWT_SECRET` y **no tiene expiracion**. Los
tokens de verificacion de email y de reset de password si expiran (7 dias y 15
minutos respectivamente).

### Errores transversales de autenticacion

| Caso | Status | Mensaje |
| --- | --- | --- |
| Falta el header `Authorization` | 400 | `Auth header is requered` |
| Header sin token despues del espacio | 400 | `Auth header is malformed` |
| Token invalido, expirado o firma incorrecta | 401 | `Auth token is invalid!` |
| No es miembro del workspace | 403 | `No eres miembro de este espacio de trabajo` |
| Rol insuficiente | 403 | `No tienes permisos suficientes para hacer esta operacion` |

### Roles dentro de un workspace

| Rol | Permisos |
| --- | --- |
| `owner` | Todo: editar y eliminar el workspace, invitar y expulsar miembros |
| `admin` | Editar el workspace, invitar y expulsar miembros |
| `user` | Consultar el workspace, sus miembros, canales y mensajes |

El `owner` se asigna automaticamente al crear el workspace. No se puede invitar
a un usuario directamente como `owner` ni expulsar al `owner`.

---

## 5. Formato de las respuestas

### Exito (2xx)

```json
{
  "ok": true,
  "status": 200,
  "message": "Mensaje descriptivo",
  "data": {}
}
```

`data` puede no estar presente en respuestas que no devuelven informacion
(registro, verificacion de email, aceptar invitacion, etc.).

### Error (4xx/5xx)

```json
{
  "ok": false,
  "status": 400,
  "message": "Descripcion del error"
}
```

Excepcion: si falla la conexion a MongoDB antes de llegar al endpoint, la API
responde `500` con `{ "message": "Error connecting to MongoDB" }`.

Los IDs de MongoDB invalidos en la URL responden `400` con
`El campo '_id' tiene un formato invalido (id incorrecto)`.

---

## 6. Endpoints implementados

Leyenda de acceso:

- **Publico:** no requiere token.
- **Bearer:** requiere `Authorization: Bearer <token>`.
- **Miembro:** requiere token y pertenecer al workspace.
- **Owner/Admin:** requiere token y rol `owner` o `admin` en el workspace.
- **Owner:** requiere token y rol `owner` en el workspace.

### Resumen general

| # | Metodo | Ruta | Acceso |
| --- | --- | --- | --- |
| 1 | `POST` | `/api/auth/register` | Publico |
| 2 | `POST` | `/api/auth/login` | Publico |
| 3 | `GET` | `/api/auth/verify-email` | Publico |
| 4 | `GET` | `/api/auth/verify-email/{email}/resend` | Publico |
| 5 | `POST` | `/api/auth/forgot-password` | Publico |
| 6 | `POST` | `/api/auth/reset-password` | Publico |
| 7 | `GET` | `/api/users` | Publico |
| 8 | `GET` | `/api/users/{user_id}` | Publico |
| 9 | `DELETE` | `/api/users/{user_id}` | Bearer (solo la propia cuenta) |
| 10 | `GET` | `/api/workspaces` | Bearer |
| 11 | `POST` | `/api/workspaces` | Bearer |
| 12 | `GET` | `/api/workspaces/{workspace_id}` | Miembro |
| 13 | `GET` | `/api/workspaces/{workspace_id}/members` | Miembro |
| 14 | `PUT` | `/api/workspaces/{workspace_id}` | Owner/Admin |
| 15 | `DELETE` | `/api/workspaces/{workspace_id}` | Owner |
| 16 | `POST` | `/api/workspaces/{workspace_id}/members/invite` | Owner/Admin |
| 17 | `GET` | `/api/workspaces/{workspace_id}/members/accept-invite/{invitation_token}` | Publico |
| 18 | `DELETE` | `/api/workspaces/{workspace_id}/members/{member_id}` | Owner/Admin |
| 19 | `GET` | `/api/workspaces/{workspace_id}/channels` | Miembro |
| 20 | `GET` | `/api/workspaces/{workspace_id}/channels/{channel_id}` | Miembro |
| 21 | `GET` | `/api/workspaces/{workspace_id}/channels/{channel_id}/messages` | Miembro |

---

### 6.1 Auth

#### 1. `POST /api/auth/register`

Registra un usuario. La contrasena se guarda hasheada con bcrypt y se envia un
mail de verificacion con un token valido por 7 dias. El usuario no puede
iniciar sesion hasta verificar el email.

Body:

```json
{
  "username": "maria",
  "email": "maria@mail.com",
  "password": "pepe123"
}
```

Respuesta `201`:

```json
{
  "ok": true,
  "status": 201,
  "message": "User registered successfully"
}
```

Errores: `400` por campos faltantes, email invalido o email ya registrado.

#### 2. `POST /api/auth/login`

Valida credenciales y que el email este verificado. Devuelve el JWT de sesion.

Body:

```json
{
  "email": "maria@mail.com",
  "password": "pepe123"
}
```

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "You have logged in successfully",
  "data": {
    "auth_token": "<jwt>"
  }
}
```

Errores: `400` por datos faltantes o email invalido, `401` por credenciales
invalidas, `403` si el email no esta verificado.

#### 3. `GET /api/auth/verify-email`

Verifica el email usando el token enviado por mail.

Query string:

```
?verification_token=<jwt>
```

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Usuario verificado exitosamente"
}
```

Errores: `400` token ausente/invalido/expirado o email ya verificado, `403`
usuario desactivado, `404` usuario no encontrado.

#### 4. `GET /api/auth/verify-email/{email}/resend`

Genera un token nuevo (invalida el anterior) y reenvia el mail de verificacion.
La respuesta es siempre la misma para no revelar si el email existe.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Se enviara un mail con los pasos para verificar en caso de que esta cuenta sea real"
}
```

#### 5. `POST /api/auth/forgot-password`

Si el usuario existe y esta activo, envia un mail con un token de reset valido
por 15 minutos. La respuesta es siempre la misma (evita email enumeration).

Body:

```json
{
  "email": "maria@mail.com"
}
```

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Se enviara un mail con los pasos para restablecer la contraseña en caso de que esta cuenta sea real"
}
```

#### 6. `POST /api/auth/reset-password`

Valida el token recibido por mail, comprueba que el email coincida con el
firmado en el token y actualiza la contrasena (hasheada con bcrypt).

Body:

```json
{
  "reset_token": "<jwt>",
  "email": "maria@mail.com",
  "nueva_password": "nuevaClave123"
}
```

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Contraseña restablecida exitosamente"
}
```

Errores: `400` por datos faltantes, email invalido, token invalido/expirado o
email que no coincide con el token; `403` usuario desactivado; `404` usuario no
encontrado.

---

### 6.2 Users

#### 7. `GET /api/users`

Devuelve todos los usuarios registrados, sin paginacion y sin autenticacion.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Get users list",
  "data": {
    "users": []
  }
}
```

> Advertencia: cada usuario incluye el hash de su contrasena (`password`).

#### 8. `GET /api/users/{user_id}`

Devuelve un usuario por su ObjectId.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Get user details successfully",
  "data": {
    "user": {}
  }
}
```

Errores: `400` id invalido, `404` usuario no encontrado.

> Advertencia: la respuesta incluye el hash de la contrasena (`password`).

#### 9. `DELETE /api/users/{user_id}`

Elimina la cuenta del usuario autenticado. El `user_id` de la URL debe coincidir
con el `id` del token (no existe un admin global). Borrado ordenado:

1. membresias de los workspaces donde el usuario es `owner`;
2. esos workspaces (se eliminan para todos sus integrantes);
3. membresias restantes del usuario;
4. el usuario.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Usuario eliminado correctamente",
  "data": {
    "user_deleted": "<ObjectId>",
    "workspaces_deleted": 1,
    "memberships_deleted": 2
  }
}
```

Errores: `400` id invalido, `401` token invalido, `403` intentar borrar otra
cuenta, `404` usuario no encontrado.

---

### 6.3 Workspaces

#### 10. `GET /api/workspaces`

Devuelve los workspaces donde el usuario autenticado tiene una membresia, con su
rol y la lista de miembros de cada workspace.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Obtenidos todos los datos",
  "data": {
    "workspaces": [
      {
        "member_id": "<ObjectId>",
        "member_rol": "owner",
        "workspace_id": "<ObjectId>",
        "workspace_nombre": "Equipo de desarrollo",
        "workspace_fecha_creacion": "2026-01-01T00:00:00.000Z",
        "members": []
      }
    ]
  }
}
```

#### 11. `POST /api/workspaces`

Crea el workspace y, automaticamente, la membresia `owner` del usuario
autenticado (`activo: true`, `invitacion_aceptada: true`).

Body:

```json
{
  "name": "Equipo de desarrollo",
  "description": "Espacio de trabajo para el proyecto final"
}
```

Respuesta `201`:

```json
{
  "ok": true,
  "status": 201,
  "message": "Workspace creado correctamente",
  "data": {
    "workspace_created": {},
    "owner_membership": {}
  }
}
```

Errores: `400` si falta `name`.

#### 12. `GET /api/workspaces/{workspace_id}`

Devuelve los datos del workspace. Requiere ser miembro (cualquier rol).

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Workspace obtenido correctamente",
  "data": {
    "workspace_selected": {}
  }
}
```

Errores: `400` id invalido, `403` no es miembro, `404` workspace no encontrado.

#### 13. `GET /api/workspaces/{workspace_id}/members`

Devuelve las membresias del workspace con nombre y email del usuario. Requiere
ser miembro.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Miembros obtenidos correctamente",
  "data": {
    "members": [
      {
        "member_id": "<ObjectId>",
        "nombre": "Maria",
        "email": "maria@mail.com",
        "member_rol": "owner",
        "fecha_creacion": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 14. `PUT /api/workspaces/{workspace_id}`

Actualiza nombre y descripcion. Requiere rol `owner` o `admin`. Ambos campos son
obligatorios (no hay actualizacion parcial).

Body:

```json
{
  "name": "Equipo de desarrollo",
  "description": "Nueva descripcion del espacio de trabajo"
}
```

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Workspace actualizado correctamente",
  "data": {
    "workspace_updated": {}
  }
}
```

Errores: `400` si falta `name` o `description`, `403` rol insuficiente, `404`
workspace no encontrado.

#### 15. `DELETE /api/workspaces/{workspace_id}`

Elimina el workspace y todas sus membresias. Solo el `owner`.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Workspace eliminado correctamente",
  "data": {
    "workspace_deleted": {}
  }
}
```

Errores: `403` no es `owner`, `404` workspace no encontrado.

---

### 6.4 Members

#### 16. `POST /api/workspaces/{workspace_id}/members/invite`

Invita a un usuario ya registrado. Crea la membresia con
`invitacion_aceptada: false` y `activo: false`, y envia un mail con un token de
invitacion valido por 7 dias. Requiere rol `owner` o `admin`.

Body:

```json
{
  "email": "pedro@mail.com",
  "rol": "user"
}
```

`rol` solo admite `admin` o `user` (no se puede invitar como `owner`).

Respuesta `201`:

```json
{
  "ok": true,
  "status": 201,
  "message": "Se envio la invitacion al mail del usuario"
}
```

Errores: `400` datos faltantes/invalidos o usuario ya miembro, `403` rol
insuficiente o usuario invitado desactivado, `404` workspace o usuario
inexistente.

#### 17. `GET /api/workspaces/{workspace_id}/members/accept-invite/{invitation_token}`

Acepta la invitacion. No requiere autenticacion: el token del link es la
credencial. Valida que el token corresponda al workspace de la URL y marca la
membresia como aceptada y activa.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Invitacion aceptada exitosamente"
}
```

Errores: `400` token invalido/expirado, de otro workspace o invitacion ya
aceptada; `404` invitacion no encontrada.

#### 18. `DELETE /api/workspaces/{workspace_id}/members/{member_id}`

Expulsa a un miembro del workspace (no borra al usuario). Requiere rol `owner` o
`admin` y no permite eliminar al `owner`.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Miembro eliminado correctamente",
  "data": {
    "member_id": "<ObjectId>"
  }
}
```

Errores: `400` intentar eliminar al `owner`, `403` rol insuficiente, `404`
workspace o membresia no encontrada.

---

### 6.5 Channels

Todos los endpoints de canales requieren ser miembro del workspace (cualquier
rol).

#### 19. `GET /api/workspaces/{workspace_id}/channels`

Lista todos los canales del workspace, sin paginacion.

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Canales obtenidos correctamente",
  "data": {
    "channels": []
  }
}
```

#### 20. `GET /api/workspaces/{workspace_id}/channels/{channel_id}`

Devuelve un canal en particular. Si el canal no existe o pertenece a otro
workspace responde `404 Canal no encontrado` (no revela la existencia de canales
de otros workspaces).

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Canal obtenido correctamente",
  "data": {
    "channel_selected": {}
  }
}
```

#### 21. `GET /api/workspaces/{workspace_id}/channels/{channel_id}/messages`

Devuelve el historial completo del canal, ordenado del mas viejo al mas nuevo y
con el autor populado (`nombre` y `email`).

Respuesta `200`:

```json
{
  "ok": true,
  "status": 200,
  "message": "Mensajes obtenidos correctamente",
  "data": {
    "messages": [
      {
        "_id": "<ObjectId>",
        "contenido": "Hola equipo",
        "fk_id_canal": "<ObjectId>",
        "fk_id_usuario": {
          "_id": "<ObjectId>",
          "nombre": "Maria",
          "email": "maria@mail.com"
        },
        "fecha_creacion": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

Errores: `403` no es miembro, `404` workspace o canal no encontrado.

---

## 7. Logger de consultas (`RegistroConsulta`)

Cada request que recibe el servidor se registra en la coleccion `RegistroConsulta`
de MongoDB. El registro se completa cuando la respuesta termina (`finish`), por
lo que ya se conoce el `user_id` autenticado y el status final.

### Campos persistidos

| Campo | Descripcion |
| --- | --- |
| `ip` | IP real del cliente (tiene en cuenta `x-forwarded-for`) |
| `url` | URL original con los parametros sensibles redactados |
| `endpoint` | Path sin query string |
| `metodo` | Metodo HTTP |
| `user_id` | Usuario autenticado, o `null` si la request es publica |
| `fecha_consulta` | Fecha y hora del registro |
| `status_code` | Codigo HTTP de la respuesta |
| `duracion_ms` | Duracion de la request en milisegundos |
| `body_cifrado` | Body cifrado, o `null` si no se registra |

### Cuando se registra el body

- Solo en metodos `POST`, `PUT` y `DELETE`.
- Nunca en los endpoints excluidos por seguridad:
  - `/api/auth/login`
  - `/api/auth/register`
  - `/api/auth/reset-password`
  - `/api/auth/forgot-password` (forma parte del flujo de reset)
- Tampoco se registra si el body esta vacio o si el cifrado falla.

### Como se cifra

El body se serializa a JSON y se cifra con **AES-256-GCM** en
`src/utils/crypto.util.js`. La clave de 32 bytes se deriva con SHA-256 a partir
de `LOGGER_PRIVATE_KEY`.

Formato guardado en `body_cifrado`:

```
v1:<iv en base64>:<auth tag en base64>:<datos en base64>
```

El contenido nunca se guarda en texto plano en la base de datos. Un ejemplo de
descifrado:

```js
import { decryptLogBody } from './src/utils/crypto.util.js'

const body = decryptLogBody(log.body_cifrado)
console.log(body)
```

> Importante: `LOGGER_PRIVATE_KEY` debe mantenerse estable. Si se cambia, los
> bodies ya guardados no se podran descifrar.

### Otros cuidados de seguridad

- Los parametros sensibles del query string (`token`, `verification_token`,
  `reset_token`, `access_token`, `password`) se guardan como `REDACTED`.
- El logger no interrumpe la request si falla MongoDB o el cifrado: el error se
  escribe en consola y la respuesta al cliente no se ve afectada.
- Los bodies de login, registro y reset no se imprimen en consola ni se
  persisten.

---

## 8. Colecciones de MongoDB

| Coleccion | Descripcion |
| --- | --- |
| `Usuario` | Usuarios: nombre, email, password hasheada, activo, email verificado |
| `EspacioTrabajo` | Workspaces: nombre, descripcion, fecha de creacion |
| `Miembro` | Membresias: usuario, workspace, rol, activo, invitacion aceptada |
| `Canal` | Canales: nombre, descripcion, workspace |
| `MensajeCanal` | Mensajes de canal: contenido, canal, autor, fecha |
| `RegistroConsulta` | Log de requests con body cifrado |

---

## 9. Proximos pasos sugeridos

1. Excluir `password` de las respuestas de usuarios.
2. Implementar creacion de canales y envio de mensajes.
3. Agregar paginacion a los listados.
4. Agregar expiracion y refresh token para las sesiones.
5. Incorporar validacion de esquemas de entrada y rate limiting.
6. Agregar tests automatizados (actualmente `npm test` no ejecuta pruebas).
