
//Middleware de errores (Oficina de errores)
//Si bien llamamos a next en este caso NO nos interesa usarlo PORQUE no hay oficina sig a la de errores

//Conclusion simple: Con este middleware de errores centralizas cualquier error de tu API, todos los errores terminaran aqui y se manejaran desde aqui
function errorHandlerMiddleware(error, request, response, next) {

    /*
    CastError: Mongoose no pudo convertir el valor a ObjectId.
    Ej: se paso un id malformado en la URL (aunque sea un string tipo "abc123").
    Sin este manejo terminaria como 500 'Internal server error'.
    */
    if (error.name === 'CastError') {
        return response.status(400).send(
            {
                ok: false,
                status: 400,
                message: `El campo '${error.path}' tiene un formato invalido (id incorrecto)`
            }
        )
    }

    //Error esperable del sistema
    if (error.status) {
        return response.status(error.status).send(
            {
                ok: false,
                status: error.status,
                message: error.message
            }
        )
    }
    //Es un error inesperado
    else {
        console.log('[Middleware de Error]:', error)
        //Error generico
        return response.status(500).send(
            {
                ok: false,
                status: 500,
                message: 'Internal server error'
            }
        )
    }
}

export default errorHandlerMiddleware