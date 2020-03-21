import fs from "fs"

export default new Promise<{
    cities: Location[]
    lookup: { [key: string]: Location }
}>((resolve, reject) => {
    fs.readFile(
        "/Users/kevinbai/Programming/twitter-scraper/src/worldcities.csv",
        (err, data) => {
            if (err) reject(err)
            const rows = data.toString("utf-8").split("\r\n")
            const dict: { [key: string]: Location } = {}
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

interface Location {
    city: string
    city_ascii: string
    lat: string
    lng: string
    country: string
    iso2: string
    iso3: string
}

function getLocation(str: string[]): Location {
    return {
        city: str[0],
        city_ascii: str[1],
        lat: str[2],
        lng: str[3],
        country: str[4],
        iso2: str[5],
        iso3: str[6]
    }
}
