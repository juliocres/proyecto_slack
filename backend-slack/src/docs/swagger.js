/*
DOCUMENTACION DE LA API (OpenAPI 3.0.3 + Swagger UI)

Este es el UNICO archivo de configuracion de la documentacion.
Aca viven:
    - la info general de la API
    - los servidores
    - los tags
    - los componentes reutilizables (schemas, responses, parameters, securitySchemes)

Los endpoints NO se documentan aca: se documentan con bloques JSDoc `@openapi`
en cada archivo de `src/routes/*.js`. `swagger-jsdoc` lee esos archivos y arma
la especificacion final combinando las anotaciones con la definicion de abajo.

La UI se monta en `/api/docs` y el JSON crudo en `/api/docs.json` (ver main.js).
*/

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import swaggerJsdoc from 'swagger-jsdoc'

const current_directory = path.dirname(fileURLToPath(import.meta.url))

const swagger_definition = {
    openapi: '3.0.3',

    info: {
        title: 'Slack API',
        version: '1.0.0',
        description: `
API de espacios de trabajo (workspaces), canales, membresias y mensajes.

## Formato de las respuestas

**Exito** (todas las respuestas 2xx):

\`\`\`json
{
  "ok": true,
  "status": 200,
  "message": "Mensaje descriptivo",
  "data": { }
}
\`\`\`

\`data\` puede no estar presente en respuestas que no devuelven informacion
(ej: registro, verificacion de email, aceptar invitacion).

**Error** (respuestas 4xx/5xx):

\`\`\`json
{
  "ok": false,
  "status": 400,
  "message": "Descripcion del error"
}
\`\`\`

Excepcion: si falla la conexion a MongoDB antes de llegar al endpoint, la API
responde \`500\` con el cuerpo \`{ "message": "Error connecting to MongoDB" }\`
(sin el sobre \`ok/status\`). Esta documentado en la respuesta 500 de cada endpoint.

## Como autenticarse en Swagger UI

1. Ejecutar \`POST /api/auth/login\` con un usuario con el email verificado.
2. Copiar el valor de \`data.auth_token\`.
3. Hacer click en **Authorize** (arriba a la derecha) y pegar **solo el token**
   (Swagger agrega automaticamente el prefijo \`Bearer \`).
4. Los endpoints protegidos enviaran \`Authorization: Bearer <token>\`.

## Errores transversales

- **Token ausente** → \`400 "Auth header is requered"\` (asi esta escrito en el codigo).
- **Header malformado** (sin token despues del espacio) → \`400 "Auth header is malformed"\`.
- **Token invalido, expirado o con firma incorrecta** → \`401 "Auth token is invalid!"\`.
- **ObjectId invalido en la URL** → \`400 "El campo '<campo>' tiene un formato invalido (id incorrecto)"\`.
- **Falta de membresia en el workspace** → \`403 "No eres miembro de este espacio de trabajo"\`.
- **Rol insuficiente** → \`403 "No tienes permisos suficientes para hacer esta operacion"\`.

Los listados **no tienen paginacion**: devuelven todos los documentos que
coincidan con el filtro.
        `.trim(),
    },

    // Servidor relativo: funciona igual en local y en Vercel, sin hardcodear el host.
    servers: [
        {
            url: '/',
            description: 'Mismo origen (local o despliegue en Vercel)',
        },
    ],

    tags: [
        {
            name: 'Auth',
            description: 'Registro, login, verificacion de email y restablecimiento de contraseña.',
        },
        {
            name: 'Users',
            description: 'Consulta de usuarios registrados.',
        },
        {
            name: 'Workspaces',
            description: 'Espacios de trabajo y sus miembros.',
        },
        {
            name: 'Members',
            description: 'Invitaciones y gestion de membresias dentro de un workspace.',
        },
        {
            name: 'Channels',
            description: 'Canales de un workspace y su historial de mensajes.',
        },
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description:
                    'JWT de sesion devuelto por POST /api/auth/login. Enviar como `Authorization: Bearer <token>`. El token no expira.',
            },
        },

        parameters: {
            WorkspaceId: {
                name: 'workspace_id',
                in: 'path',
                required: true,
                description: 'ObjectId del espacio de trabajo.',
                schema: { type: 'string' },
                example: '6aabff9a190ff6061955c889',
            },
            ChannelId: {
                name: 'channel_id',
                in: 'path',
                required: true,
                description: 'ObjectId del canal.',
                schema: { type: 'string' },
                example: '6ab0c1d2e3f4a5b6c7d8e9f0',
            },
            MemberId: {
                name: 'member_id',
                in: 'path',
                required: true,
                description: 'ObjectId de la membresia (no del usuario).',
                schema: { type: 'string' },
                example: '6ab0c1d2e3f4a5b6c7d8e9f1',
            },
            UserId: {
                name: 'user_id',
                in: 'path',
                required: true,
                description: 'ObjectId del usuario.',
                schema: { type: 'string' },
                example: '6aabff9a190ff6061955c889',
            },
            EmailPath: {
                name: 'email',
                in: 'path',
                required: true,
                description: 'Email del usuario.',
                schema: { type: 'string', format: 'email' },
                example: 'maria@mail.com',
            },
            VerificationToken: {
                name: 'verification_token',
                in: 'query',
                required: true,
                description:
                    'JWT de verificacion de email recibido por correo. Valido por 7 dias.',
                schema: { type: 'string' },
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            InvitationToken: {
                name: 'invitation_token',
                in: 'path',
                required: true,
                description:
                    'JWT de invitacion recibido por correo. Valido por 7 dias. El token ES la credencial: este endpoint no pide autenticacion.',
                schema: { type: 'string' },
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },

        schemas: {
            ErrorResponse: {
                type: 'object',
                required: ['ok', 'status', 'message'],
                properties: {
                    ok: { type: 'boolean', example: false },
                    status: { type: 'integer', example: 400 },
                    message: { type: 'string', example: 'Descripcion del error' },
                },
            },

            MongoConnectionError: {
                type: 'object',
                required: ['message'],
                properties: {
                    message: {
                        type: 'string',
                        example: 'Error connecting to MongoDB',
                    },
                },
            },

            // ---------- Respuestas de exito ----------
            MessageOnlyResponse: {
                type: 'object',
                required: ['ok', 'status', 'message'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Operacion realizada correctamente' },
                },
            },

            RegisterResponse: {
                type: 'object',
                required: ['ok', 'status', 'message'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 201 },
                    message: { type: 'string', example: 'User registered successfully' },
                },
            },

            LoginResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'You have logged in successfully' },
                    data: {
                        type: 'object',
                        required: ['auth_token'],
                        properties: {
                            auth_token: {
                                type: 'string',
                                description: 'JWT de sesion. Usarlo como Bearer token.',
                                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                            },
                        },
                    },
                },
            },

            UsersListResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Get users list' },
                    data: {
                        type: 'object',
                        required: ['users'],
                        properties: {
                            users: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                },
            },

            UserDetailResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Get user details successfully' },
                    data: {
                        type: 'object',
                        required: ['user'],
                        properties: {
                            user: { $ref: '#/components/schemas/User' },
                        },
                    },
                },
            },

            WorkspaceListResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Obtenidos todos los datos' },
                    data: {
                        type: 'object',
                        required: ['workspaces'],
                        properties: {
                            workspaces: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/WorkspaceSummary' },
                            },
                        },
                    },
                },
            },

            WorkspaceCreatedResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 201 },
                    message: { type: 'string', example: 'Workspace creado correctamente' },
                    data: {
                        type: 'object',
                        required: ['workspace_created', 'owner_membership'],
                        properties: {
                            workspace_created: { $ref: '#/components/schemas/Workspace' },
                            owner_membership: { $ref: '#/components/schemas/Member' },
                        },
                    },
                },
            },

            WorkspaceDetailResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Workspace obtenido correctamente' },
                    data: {
                        type: 'object',
                        required: ['workspace_selected'],
                        properties: {
                            workspace_selected: { $ref: '#/components/schemas/Workspace' },
                        },
                    },
                },
            },

            WorkspaceUpdatedResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Workspace actualizado correctamente' },
                    data: {
                        type: 'object',
                        required: ['workspace_updated'],
                        properties: {
                            workspace_updated: { $ref: '#/components/schemas/Workspace' },
                        },
                    },
                },
            },

            WorkspaceDeletedResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Workspace eliminado correctamente' },
                    data: {
                        type: 'object',
                        required: ['workspace_deleted'],
                        properties: {
                            workspace_deleted: { $ref: '#/components/schemas/Workspace' },
                        },
                    },
                },
            },

            MembersListResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Miembros obtenidos correctamente' },
                    data: {
                        type: 'object',
                        required: ['members'],
                        properties: {
                            members: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/MemberSummary' },
                            },
                        },
                    },
                },
            },

            MemberDeletedResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Miembro eliminado correctamente' },
                    data: {
                        type: 'object',
                        required: ['member_id'],
                        properties: {
                            member_id: {
                                type: 'string',
                                example: '6ab0c1d2e3f4a5b6c7d8e9f1',
                            },
                        },
                    },
                },
            },

            ChannelsListResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Canales obtenidos correctamente' },
                    data: {
                        type: 'object',
                        required: ['channels'],
                        properties: {
                            channels: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Channel' },
                            },
                        },
                    },
                },
            },

            ChannelDetailResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Canal obtenido correctamente' },
                    data: {
                        type: 'object',
                        required: ['channel_selected'],
                        properties: {
                            channel_selected: { $ref: '#/components/schemas/Channel' },
                        },
                    },
                },
            },

            MessagesListResponse: {
                type: 'object',
                required: ['ok', 'status', 'message', 'data'],
                properties: {
                    ok: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Mensajes obtenidos correctamente' },
                    data: {
                        type: 'object',
                        required: ['messages'],
                        properties: {
                            messages: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/ChannelMessage' },
                            },
                        },
                    },
                },
            },

            // ---------- Documentos de dominio ----------
            User: {
                type: 'object',
                description:
                    'Documento de usuario tal como lo devuelve MongoDB. ADVERTENCIA: incluye el hash de la contraseña.',
                properties: {
                    _id: { type: 'string', example: '6aabff9a190ff6061955c889' },
                    nombre: { type: 'string', example: 'maria' },
                    email: { type: 'string', format: 'email', example: 'maria@mail.com' },
                    password: {
                        type: 'string',
                        description: 'Hash bcrypt de la contraseña (NO es la contraseña original).',
                        example: '$2b$10$abcdefghijklmnopqrstuv',
                    },
                    fecha_creacion: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-09-17T14:56:26.249Z',
                    },
                    activo: { type: 'boolean', example: true },
                    email_verificado: { type: 'boolean', example: false },
                    __v: {
                        type: 'integer',
                        description: 'Version interna de Mongoose.',
                        example: 0,
                    },
                },
            },

            Workspace: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '6ab0c1d2e3f4a5b6c7d8e9f0' },
                    nombre: { type: 'string', example: 'Equipo de desarrollo' },
                    description: {
                        type: 'string',
                        example: 'Espacio de trabajo para el proyecto final',
                    },
                    fecha_creacion: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-09-17T14:56:26.249Z',
                    },
                    __v: { type: 'integer', example: 0 },
                },
            },

            WorkspaceSummary: {
                type: 'object',
                description:
                    'Forma "mapeada" que devuelve GET /api/workspaces: combina la membresia del usuario con los datos del workspace y la lista de sus miembros.',
                properties: {
                    member_id: { type: 'string', example: '6ab0c1d2e3f4a5b6c7d8e9f1' },
                    member_rol: {
                        type: 'string',
                        enum: ['user', 'admin', 'owner'],
                        example: 'owner',
                    },
                    workspace_id: { type: 'string', example: '6ab0c1d2e3f4a5b6c7d8e9f0' },
                    workspace_nombre: { type: 'string', example: 'Equipo de desarrollo' },
                    workspace_fecha_creacion: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-09-17T14:56:26.249Z',
                    },
                    members: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MemberSummary' },
                    },
                },
            },

            MemberSummary: {
                type: 'object',
                description:
                    'Forma "mapeada" de una membresia con los datos del usuario populados.',
                properties: {
                    member_id: { type: 'string', example: '6ab0c1d2e3f4a5b6c7d8e9f1' },
                    nombre: { type: 'string', example: 'maria' },
                    email: { type: 'string', format: 'email', example: 'maria@mail.com' },
                    member_rol: {
                        type: 'string',
                        enum: ['user', 'admin', 'owner'],
                        example: 'admin',
                    },
                    fecha_creacion: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-09-17T14:56:26.249Z',
                    },
                },
            },

            Member: {
                type: 'object',
                description:
                    'Documento crudo de membresia devuelto por MongoDB, con el usuario populado (solo nombre y email).',
                properties: {
                    _id: { type: 'string', example: '6ab0c1d2e3f4a5b6c7d8e9f1' },
                    fk_id_usuario: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '6aabff9a190ff6061955c889' },
                            nombre: { type: 'string', example: 'maria' },
                            email: { type: 'string', format: 'email', example: 'maria@mail.com' },
                        },
                    },
                    fk_id_espacio_trabajo: {
                        type: 'string',
                        example: '6ab0c1d2e3f4a5b6c7d8e9f0',
                    },
                    rol: {
                        type: 'string',
                        enum: ['user', 'admin', 'owner'],
                        example: 'owner',
                    },
                    fecha_creacion: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-09-17T14:56:26.249Z',
                    },
                    activo: { type: 'boolean', example: true },
                    invitacion_aceptada: { type: 'boolean', example: true },
                    __v: { type: 'integer', example: 0 },
                },
            },

            Channel: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '6ab0c1d2e3f4a5b6c7d8e9f0' },
                    nombre: { type: 'string', example: 'general' },
                    descripcion: {
                        type: 'string',
                        example: 'Canal general del espacio de trabajo',
                    },
                    fk_id_espacio_trabajo: {
                        type: 'string',
                        example: '6ab0c1d2e3f4a5b6c7d8e9f0',
                    },
                    fecha_creacion: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-09-17T14:56:26.249Z',
                    },
                    __v: { type: 'integer', example: 0 },
                },
            },

            ChannelMessage: {
                type: 'object',
                description:
                    'Mensaje de canal con el autor populado (solo nombre y email). Ordenados del mas viejo al mas nuevo.',
                properties: {
                    _id: { type: 'string', example: '6ab0c1d2e3f4a5b6c7d8e9f2' },
                    contenido: { type: 'string', example: 'Hola equipo!' },
                    fk_id_canal: { type: 'string', example: '6ab0c1d2e3f4a5b6c7d8e9f0' },
                    fk_id_usuario: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '6aabff9a190ff6061955c889' },
                            nombre: { type: 'string', example: 'maria' },
                            email: { type: 'string', format: 'email', example: 'maria@mail.com' },
                        },
                    },
                    fecha_creacion: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-09-17T14:56:26.249Z',
                    },
                    __v: { type: 'integer', example: 0 },
                },
            },
        },

        responses: {
            BadRequest: {
                description: 'Solicitud invalida (datos faltantes, formato incorrecto, etc).',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            ok: false,
                            status: 400,
                            message: 'Descripcion del error',
                        },
                    },
                },
            },

            Unauthorized: {
                description:
                    'Token de sesion invalido, expirado o con firma incorrecta.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            ok: false,
                            status: 401,
                            message: 'Auth token is invalid!',
                        },
                    },
                },
            },

            Forbidden: {
                description:
                    'El usuario esta autenticado pero no es miembro del workspace, no tiene el rol requerido o su cuenta esta desactivada.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            ok: false,
                            status: 403,
                            message: 'No eres miembro de este espacio de trabajo',
                        },
                    },
                },
            },

            NotFound: {
                description: 'El recurso solicitado no existe o no pertenece al workspace.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            ok: false,
                            status: 404,
                            message: 'Recurso no encontrado',
                        },
                    },
                },
            },

            InternalServerError: {
                description:
                    'Error inesperado del servidor o fallo al conectar con MongoDB.',
                content: {
                    'application/json': {
                        schema: {
                            oneOf: [
                                { $ref: '#/components/schemas/ErrorResponse' },
                                { $ref: '#/components/schemas/MongoConnectionError' },
                            ],
                        },
                        examples: {
                            error_inesperado: {
                                summary: 'Error inesperado',
                                value: {
                                    ok: false,
                                    status: 500,
                                    message: 'Internal server error',
                                },
                            },
                            error_conexion_mongo: {
                                summary: 'Fallo de conexion a MongoDB',
                                value: {
                                    message: 'Error connecting to MongoDB',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}

const swagger_options = {
    definition: swagger_definition,
    // Glob absoluto: no depende del working directory (local vs Vercel) ni del SO.
    // glob en Windows necesita separadores "/" (con "\" no matchea ningun archivo).
    // Se incluyen dos candidatos porque Vercel puede empaquetar la app y cambiar
    // la ubicacion de los archivos: el relativo al modulo y el relativo al cwd.
    apis: [
        `${path.join(current_directory, '..', 'routes').replace(/\\/g, '/')}/*.js`,
        `${path.join(process.cwd(), 'src', 'routes').replace(/\\/g, '/')}/*.js`,
    ],
}

const swagger_document = swaggerJsdoc(swagger_options)

export default swagger_document
