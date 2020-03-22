import fs from "fs"
import {
    JSONCountryData,
    JSONRegionData,
    Region,
    Countries,
    JSONCityData,
    Country,
    City
} from "./types"

export function normalizeString(str: string) {
    return str
        .normalize("NFKD")
        .toLowerCase()
        .replace(/ +/g, " ")
        .replace(/[\u0300-\u036F]/g, "")
        .replace(/\./g, "")
}

export function generateCountry(data: JSONCountryData): Country {
    return {
        id: data.id,
        name: normalizeString(data.name),
        iso2: normalizeString(data.iso2),
        iso3: normalizeString(data.iso3)
    }
}

export function generateRegion(
    data: JSONRegionData,
    countriesLookup: Countries
): Region {
    return {
        id: data.id,
        name: normalizeString(data.name),
        abbr: normalizeString(data.state_code),
        country: countriesLookup[normalizeString(data.country_code)].name
    }
}

export function generateCity(
    data: JSONCityData,
    countriesLookup: Countries,
    regionsLookupById: { [key: number]: Region }
): City {
    const region = regionsLookupById[data.state_id]
    const country = countriesLookup[normalizeString(data.country_code)]
    return {
        id: parseInt(data.id),
        name: normalizeString(data.name),
        region: region.name,
        regionCode: region.abbr,
        country: country.name,
        lat: data.latitude,
        lng: data.longitude
    }
}

export function readStream<T>(path: string): Promise<T> {
    return new Promise<T>((res, rej) => {
        let text = ""
        fs.createReadStream(path)
            .on("data", (data: Buffer) => {
                text += data
            })
            .on("end", () => {
                res(JSON.parse(text) as T)
            })
            .on("error", rej)
    })
}
