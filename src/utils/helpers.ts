export function normalizeString(str: string) {
    return str.toLowerCase().replace(/ +/g, " ")
}
