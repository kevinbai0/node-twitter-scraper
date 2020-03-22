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

export type Location = City | Region | Country

export interface Entity {
    partial: { isAbbr: boolean; obj: Location }[]
    complete: { isAbbr: boolean; obj: Location }[]
}

export type Countries = { [key: string]: Country }
export type Regions = { [key: string]: Region[] }
export type Cities = { [key: string]: City[] }

export type RegionsById = { [key: number]: Region }

export type Entities = { [key: string]: Entity }
