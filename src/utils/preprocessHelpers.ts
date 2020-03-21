import fs from "fs"

export interface JSONCountryData {
    id: number
    name: string
    iso3: string
    iso2: string
}

export interface JSONRegionData {
    id: number
    name: string
    country_code: string
    state_code: string
}

export interface JSONCityData {
    id: string
    name: string
    state_id: number
    state_code: string
    country_code: string
    latitude: string
    longitude: string
}

export interface Country {
    id: number
    name: string
    iso3: string
    iso2: string
}

export interface Region {
    id: number
    name: string
    abbr: string
    country: string
}

export interface City {
    id: number
    name: string
    region: string
    regionCode: string
    country: string
    lat: string
    lng: string
}

export type Countries = { [key: string]: Country }
export type Regions = { [key: string]: Region[] }
export type Cities = { [key: string]: City[] }

export type RegionsById = { [key: number]: Region }

export function generateCountry(data: JSONCountryData): Country {
    return {
        id: data.id,
        name: data.name.toLowerCase(),
        iso2: data.iso2.toLowerCase(),
        iso3: data.iso3.toLowerCase()
    }
}

export function generateRegion(
    data: JSONRegionData,
    countriesLookup: Countries
): Region {
    return {
        id: data.id,
        name: data.name.toLowerCase(),
        abbr: data.state_code.toLowerCase(),
        country: countriesLookup[data.country_code.toLowerCase()].name
    }
}

export function generateCity(
    data: JSONCityData,
    countriesLookup: Countries,
    regionsLookupById: { [key: number]: Region }
): City {
    const region = regionsLookupById[data.state_id]
    const country = countriesLookup[data.country_code.toLowerCase()]
    return {
        id: parseInt(data.id),
        name: data.name.toLowerCase(),
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
