const AVATAR_COLORS = [
    "#f5498d",
    "#e8912d",
    "#2eb67d",
    "#36c5f0",
    "#7c3aed",
    "#e01e5a",
    "#1264a3",
    "#ecb22e",
]

export function getInitial(nombre) {
    return nombre?.trim()?.charAt(0).toUpperCase() || "?"
}

export function getInitials(nombre) {
    const words = nombre?.trim()?.split(/\s+/) ?? []

    const initials = words
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()

    return initials || "WS"
}

export function getAvatarColor(nombre) {
    let hash = 0
    const texto = nombre || ""

    for (let i = 0; i < texto.length; i++) {
        hash = (hash * 31 + texto.charCodeAt(i)) >>> 0
    }

    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}
