import fs from "fs"

export default new Promise<{
    cities: USACity[]
    lookup: { [key: string]: USACity }
}>((resolve, reject) => {
    fs.readFile(
        "/Users/kevinbai/Programming/twitter-scraper/src/uscities.csv",
        (err, data) => {
            if (err) reject(err)
            const rows = data.toString("utf-8").split("\n")
            const dict: { [key: string]: USACity } = {}
            const locations = rows.map(row => {
                const cols = row.split(",")
                const loc = getLocation(cols.map(col => col.slice(1, -1)))
                dict[loc.city_ascii] = loc
                return loc
            })
            resolve({
                cities: locations.slice(1),
                lookup: dict
            })
        }
    )
})

interface USACity {
    city: string
    city_ascii: string
    state_id: string
    state_name: string
}

function getLocation(str: string[]): USACity {
    return {
        city: str[0],
        city_ascii: str[1],
        state_id: str[2],
        state_name: str[3]
    }
}
