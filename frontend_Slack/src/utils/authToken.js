/*
El nombre del usuario se guarda en el payload del JWT al iniciar sesion.
Se decodifica solo para mostrar sus datos en la interfaz: no valida la firma
(eso lo hace el backend en cada request).
*/
export function getCurrentUser() {
    try {
        const auth_token = localStorage.getItem("auth_token")

        if (!auth_token) {
            return null
        }

        const payload = auth_token.split(".")[1]

        if (!payload) {
            return null
        }

        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
        const padded = base64.padEnd(
            base64.length + (4 - (base64.length % 4)) % 4,
            "="
        )

        return JSON.parse(atob(padded))
    }
    catch {
        return null
    }
}

export function clearAuthToken() {
    localStorage.removeItem("auth_token")
}
